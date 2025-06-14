// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/security/Pausable.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
// SafeMath not needed in Solidity 0.8+ (built-in overflow protection)

import {IPropertyEscrow} from "../interfaces/IPropertyEscrow.sol";
import {EscrowStructs} from "../libraries/EscrowStructs.sol";

// Custom errors for gas efficiency
error InvalidAddress(string param);
error InvalidAmount(string param);
error InvalidDeadline(string param);
error InvalidEscrowState(uint256 escrowId, EscrowStructs.EscrowState current, EscrowStructs.EscrowState required);
error UnauthorizedAccess(address caller, string role);
error DeadlinePassed(uint256 deadline, uint256 currentTime);
error AlreadyApproved(address participant);
error TokenNotWhitelisted(address token);
error ReleaseFundsConditionsNotMet(uint256 escrowId);
error InvalidEscrowId(uint256 escrowId);
error FeeTooHigh(uint256 fee, uint256 maxFee);

/**
 * @title PropertyEscrow
 * @dev Smart contract for managing property sale escrows with multi-role support
 * @notice This contract handles the complete lifecycle of property sales through escrow
 */
contract PropertyEscrow is IPropertyEscrow, ReentrancyGuard, Pausable, AccessControl {
    using SafeERC20 for IERC20;

    // Role definitions
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant AGENT_ROLE = keccak256("AGENT_ROLE");
    bytes32 public constant ARBITER_ROLE = keccak256("ARBITER_ROLE");

    // State variables
    mapping(uint256 => EscrowStructs.Escrow) private escrows;
    mapping(uint256 => EscrowStructs.Dispute) private disputes;
    mapping(address => bool) public whitelistedTokens;
    
    uint256 private escrowCounter;
    uint256 public platformFeePercentage; // In basis points (100 = 1%)
    address public platformWallet;

    // Constants
    uint256 public constant MAX_PLATFORM_FEE = 500; // 5% maximum
    uint256 public constant BASIS_POINTS = 10000;

    /// @notice Restricts access to escrow participants and admins only
    /// @param escrowId The ID of the escrow to check authorization for
    /// @dev Checks if caller is buyer, seller, agent, arbiter, or has admin role
    modifier onlyEscrowParticipant(uint256 escrowId) {
        EscrowStructs.Escrow memory escrow = escrows[escrowId];
        if (!(msg.sender == escrow.buyer ||
            msg.sender == escrow.seller ||
            msg.sender == escrow.agent ||
            msg.sender == escrow.arbiter ||
            hasRole(ADMIN_ROLE, msg.sender))) {
            revert UnauthorizedAccess(msg.sender, "escrow participant");
        }
        _;
    }

    /// @notice Ensures the escrow ID exists in the system
    /// @param escrowId The ID of the escrow to validate
    /// @dev Checks if escrowId is less than the current counter (valid range)
    modifier onlyValidEscrow(uint256 escrowId) {
        if (escrowId >= escrowCounter) {
            revert InvalidEscrowId(escrowId);
        }
        _;
    }

    /// @notice Restricts function access based on escrow state
    /// @param escrowId The ID of the escrow to check
    /// @param requiredState The required state for the escrow
    /// @dev Used to enforce state machine transitions
    modifier onlyInState(uint256 escrowId, EscrowStructs.EscrowState requiredState) {
        if (escrows[escrowId].state != requiredState) {
            revert InvalidEscrowState(escrowId, escrows[escrowId].state, requiredState);
        }
        _;
    }

    /// @notice Initializes the PropertyEscrow contract
    /// @param _platformWallet Address to receive platform fees
    /// @param _platformFeePercentage Platform fee in basis points (100 = 1%)
    /// @dev Sets up initial roles and validates parameters
    constructor(address _platformWallet, uint256 _platformFeePercentage) {
        if (_platformWallet == address(0)) {
            revert InvalidAddress("platformWallet");
        }
        if (_platformFeePercentage > MAX_PLATFORM_FEE) {
            revert FeeTooHigh(_platformFeePercentage, MAX_PLATFORM_FEE);
        }

        platformWallet = _platformWallet;
        platformFeePercentage = _platformFeePercentage;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    /// @notice Creates a new escrow for a property sale transaction
    /// @param params The parameters for creating the escrow including buyer, seller, amounts, and deadlines
    /// @return The unique ID of the created escrow
    /// @dev Validates all parameters, creates escrow storage, and emits EscrowCreated event
    function createEscrow(
        EscrowStructs.CreateEscrowParams calldata params
    ) external override nonReentrant whenNotPaused returns (uint256) {
        // Validation
        require(params.buyer != address(0), "Invalid buyer address");
        require(params.seller != address(0), "Invalid seller address");
        require(params.buyer != params.seller, "Buyer and seller must be different");
        require(params.tokenAddress != address(0), "Invalid token address");
        require(whitelistedTokens[params.tokenAddress], "Token not whitelisted");
        require(params.depositAmount > 0, "Deposit amount must be positive");
        require(params.depositDeadline > block.timestamp, "Invalid deposit deadline");
        require(params.verificationDeadline > params.depositDeadline, "Invalid verification deadline");
        require(bytes(params.property.propertyId).length > 0, "Property ID required");

        uint256 escrowId = escrowCounter++;

        // Create escrow
        EscrowStructs.Escrow storage newEscrow = escrows[escrowId];
        newEscrow.id = escrowId;
        newEscrow.buyer = params.buyer;
        newEscrow.seller = params.seller;
        newEscrow.agent = params.agent;
        newEscrow.arbiter = params.arbiter;
        newEscrow.tokenAddress = params.tokenAddress;
        newEscrow.depositAmount = params.depositAmount;
        newEscrow.agentFee = params.agentFee;
        newEscrow.platformFee = params.platformFee;
        newEscrow.state = EscrowStructs.EscrowState.Created;
        newEscrow.property = params.property;
        newEscrow.createdAt = block.timestamp;
        newEscrow.depositDeadline = params.depositDeadline;
        newEscrow.verificationDeadline = params.verificationDeadline;

        emit EscrowCreated(escrowId, params.buyer, params.seller, params.depositAmount);

        return escrowId;
    }

    /// @notice Allows the buyer to deposit funds into the escrow contract
    /// @param escrowId The unique identifier of the escrow transaction
    /// @dev Transfers tokens from buyer to contract, updates state to Deposited, validates deadline
    function depositFunds(uint256 escrowId) 
        external 
        override 
        nonReentrant 
        whenNotPaused 
        onlyValidEscrow(escrowId)
        onlyInState(escrowId, EscrowStructs.EscrowState.Created)
    {
        EscrowStructs.Escrow storage escrow = escrows[escrowId];
        
        require(msg.sender == escrow.buyer, "Only buyer can deposit");
        require(block.timestamp <= escrow.depositDeadline, "Deposit deadline passed");

        // Transfer tokens from buyer to this contract
        IERC20(escrow.tokenAddress).safeTransferFrom(
            msg.sender,
            address(this),
            escrow.depositAmount
        );

        escrow.state = EscrowStructs.EscrowState.Deposited;

        emit FundsDeposited(escrowId, msg.sender, escrow.depositAmount);
    }

    /// @notice Completes the property verification process
    /// @param escrowId The unique identifier of the escrow transaction
    /// @dev Only callable by agent, arbiter, or admin. Updates state to Verified and emits event
    function completeVerification(uint256 escrowId)
        external
        override
        nonReentrant
        whenNotPaused
        onlyValidEscrow(escrowId)
        onlyInState(escrowId, EscrowStructs.EscrowState.Deposited)
    {
        EscrowStructs.Escrow storage escrow = escrows[escrowId];
        
        require(
            msg.sender == escrow.agent || hasRole(ADMIN_ROLE, msg.sender),
            "Only agent or admin can verify"
        );
        require(block.timestamp <= escrow.verificationDeadline, "Verification deadline passed");

        escrow.state = EscrowStructs.EscrowState.Verified;
        escrow.property.verified = true;

        emit VerificationCompleted(escrowId, msg.sender);
    }

    /// @notice Allows escrow participants to approve fund release
    /// @param escrowId The unique identifier of the escrow transaction
    /// @dev Only buyer, seller, or agent can approve. Each can only approve once
    function giveApproval(uint256 escrowId)
        external
        override
        nonReentrant
        whenNotPaused
        onlyValidEscrow(escrowId)
        onlyInState(escrowId, EscrowStructs.EscrowState.Verified)
    {
        EscrowStructs.Escrow storage escrow = escrows[escrowId];
        EscrowStructs.Role role;

        if (msg.sender == escrow.buyer) {
            require(!escrow.buyerApproval, "Buyer already approved");
            escrow.buyerApproval = true;
            role = EscrowStructs.Role.Buyer;
        } else if (msg.sender == escrow.seller) {
            require(!escrow.sellerApproval, "Seller already approved");
            escrow.sellerApproval = true;
            role = EscrowStructs.Role.Seller;
        } else if (msg.sender == escrow.agent) {
            require(!escrow.agentApproval, "Agent already approved");
            escrow.agentApproval = true;
            role = EscrowStructs.Role.Agent;
        } else {
            revert("Not authorized to approve");
        }

        emit ApprovalGiven(escrowId, msg.sender, role);
    }

    /// @notice Convenience function to approve release for the first escrow (ID 0)
    /// @dev Legacy function for backward compatibility, delegates to escrow 0
    function approveRelease() external {
        // Duplicate the logic from giveApproval for escrow 0
        EscrowStructs.Escrow storage escrow = escrows[0];
        EscrowStructs.Role role;

        if (msg.sender == escrow.buyer) {
            require(!escrow.buyerApproval, "Buyer already approved");
            escrow.buyerApproval = true;
            role = EscrowStructs.Role.Buyer;
        } else if (msg.sender == escrow.seller) {
            require(!escrow.sellerApproval, "Seller already approved");
            escrow.sellerApproval = true;
            role = EscrowStructs.Role.Seller;
        } else if (msg.sender == escrow.agent) {
            require(!escrow.agentApproval, "Agent already approved");
            escrow.agentApproval = true;
            role = EscrowStructs.Role.Agent;
        } else {
            revert("Not authorized to approve");
        }

        emit ApprovalGiven(0, msg.sender, role);
    }

    /// @notice Releases escrowed funds to the seller when all conditions are met
    /// @param escrowId The unique identifier of the escrow transaction
    /// @dev Distributes funds to seller, agent, and platform after validating approvals
    function releaseFunds(uint256 escrowId)
        external
        override
        nonReentrant
        whenNotPaused
        onlyValidEscrow(escrowId)
        onlyInState(escrowId, EscrowStructs.EscrowState.Verified)
    {
        require(canReleaseFunds(escrowId), "Release conditions not met");
        
        EscrowStructs.Escrow storage escrow = escrows[escrowId];
        
        // Calculate amounts
        uint256 platformFeeAmount = (escrow.depositAmount * escrow.platformFee) / BASIS_POINTS;
        uint256 agentFeeAmount = escrow.agentFee;
        uint256 sellerAmount = escrow.depositAmount - platformFeeAmount - agentFeeAmount;

        escrow.state = EscrowStructs.EscrowState.Released;

        // Transfer funds
        IERC20 token = IERC20(escrow.tokenAddress);
        
        if (platformFeeAmount > 0) {
            token.safeTransfer(platformWallet, platformFeeAmount);
        }
        
        if (agentFeeAmount > 0 && escrow.agent != address(0)) {
            token.safeTransfer(escrow.agent, agentFeeAmount);
        }
        
        token.safeTransfer(escrow.seller, sellerAmount);

        emit FundsReleased(escrowId, escrow.seller, sellerAmount);
    }

    /**
     * @dev Raises a dispute for the escrow
     * @param escrowId The ID of the escrow
     * @param reason The reason for the dispute
     */
    function raiseDispute(uint256 escrowId, string calldata reason)
        external
        override
        nonReentrant
        whenNotPaused
        onlyValidEscrow(escrowId)
        onlyEscrowParticipant(escrowId)
    {
        EscrowStructs.Escrow storage escrow = escrows[escrowId];
        
        require(
            escrow.state == EscrowStructs.EscrowState.Deposited ||
            escrow.state == EscrowStructs.EscrowState.Verified,
            "Cannot dispute in current state"
        );
        require(bytes(reason).length > 0, "Dispute reason required");

        escrow.state = EscrowStructs.EscrowState.Disputed;
        escrow.disputeReason = reason;

        // Create dispute record
        disputes[escrowId] = EscrowStructs.Dispute({
            initiator: msg.sender,
            reason: reason,
            timestamp: block.timestamp,
            resolved: false,
            resolvedBy: address(0),
            resolution: ""
        });

        emit DisputeRaised(escrowId, msg.sender, reason);
    }

    /**
     * @dev Resolves a dispute (called by arbiter or admin)
     * @param escrowId The ID of the escrow
     * @param favorBuyer Whether to favor the buyer in the resolution
     * @param resolution The resolution details
     */
    function resolveDispute(
        uint256 escrowId,
        bool favorBuyer,
        string calldata resolution
    )
        external
        override
        nonReentrant
        whenNotPaused
        onlyValidEscrow(escrowId)
        onlyInState(escrowId, EscrowStructs.EscrowState.Disputed)
    {
        EscrowStructs.Escrow storage escrow = escrows[escrowId];
        
        require(
            msg.sender == escrow.arbiter || hasRole(ADMIN_ROLE, msg.sender),
            "Only arbiter or admin can resolve"
        );

        // Update dispute record
        EscrowStructs.Dispute storage dispute = disputes[escrowId];
        dispute.resolved = true;
        dispute.resolvedBy = msg.sender;
        dispute.resolution = resolution;

        if (favorBuyer) {
            _refundBuyer(escrowId);
        } else {
            // Set state to verified so funds can be released to seller
            escrow.state = EscrowStructs.EscrowState.Verified;
            escrow.buyerApproval = true;
            escrow.sellerApproval = true;
            escrow.agentApproval = true;
        }

        emit DisputeResolved(escrowId, msg.sender, resolution);
    }

    /**
     * @dev Refunds the buyer (called by admin or in dispute resolution)
     * @param escrowId The ID of the escrow
     */
    function refundBuyer(uint256 escrowId)
        external
        override
        nonReentrant
        whenNotPaused
        onlyValidEscrow(escrowId)
    {
        require(hasRole(ADMIN_ROLE, msg.sender), "Only admin can refund");
        _refundBuyer(escrowId);
    }

    /**
     * @dev Internal function to refund buyer
     * @param escrowId The ID of the escrow
     */
    function _refundBuyer(uint256 escrowId) internal {
        EscrowStructs.Escrow storage escrow = escrows[escrowId];
        
        require(
            escrow.state == EscrowStructs.EscrowState.Deposited ||
            escrow.state == EscrowStructs.EscrowState.Disputed ||
            escrow.state == EscrowStructs.EscrowState.Verified,
            "Cannot refund in current state"
        );

        escrow.state = EscrowStructs.EscrowState.Refunded;

        // Refund the full deposit amount to buyer
        IERC20(escrow.tokenAddress).safeTransfer(escrow.buyer, escrow.depositAmount);

        emit FundsRefunded(escrowId, escrow.buyer, escrow.depositAmount);
    }

    /**
     * @dev Cancels an escrow (only before deposit)
     * @param escrowId The ID of the escrow
     */
    function cancelEscrow(uint256 escrowId)
        external
        override
        nonReentrant
        whenNotPaused
        onlyValidEscrow(escrowId)
        onlyInState(escrowId, EscrowStructs.EscrowState.Created)
        onlyEscrowParticipant(escrowId)
    {
        escrows[escrowId].state = EscrowStructs.EscrowState.Cancelled;
        emit EscrowCancelled(escrowId, msg.sender);
    }

    /**
     * @dev Checks if funds can be released for an escrow
     * @param escrowId The ID of the escrow
     * @return Whether funds can be released
     */
    function canReleaseFunds(uint256 escrowId) 
        public 
        view 
        override 
        onlyValidEscrow(escrowId) 
        returns (bool) 
    {
        EscrowStructs.Escrow memory escrow = escrows[escrowId];
        
        return escrow.state == EscrowStructs.EscrowState.Verified &&
               escrow.property.verified &&
               escrow.buyerApproval &&
               escrow.sellerApproval &&
               (escrow.agent == address(0) || escrow.agentApproval);
    }

    /**
     * @dev Gets escrow details
     * @param escrowId The ID of the escrow
     * @return The escrow data
     */
    function getEscrow(uint256 escrowId) 
        external 
        view 
        override 
        onlyValidEscrow(escrowId) 
        returns (EscrowStructs.Escrow memory) 
    {
        return escrows[escrowId];
    }

    /**
     * @dev Gets escrow state
     * @param escrowId The ID of the escrow
     * @return The current state of the escrow
     */
    function getEscrowState(uint256 escrowId) 
        external 
        view 
        override 
        onlyValidEscrow(escrowId) 
        returns (EscrowStructs.EscrowState) 
    {
        return escrows[escrowId].state;
    }

    /**
     * @dev Gets total number of escrows created
     * @return The total number of escrows
     */
    function getTotalEscrows() external view override returns (uint256) {
        return escrowCounter;
    }

    /**
     * @dev Admin function to whitelist tokens
     * @param token The token address to whitelist
     * @param whitelisted Whether the token should be whitelisted
     */
    function whitelistToken(address token, bool whitelisted) external onlyRole(ADMIN_ROLE) {
        whitelistedTokens[token] = whitelisted;
    }

    /**
     * @dev Admin function to set platform fee
     * @param fee The new platform fee in basis points
     */
    function setPlatformFee(uint256 fee) external onlyRole(ADMIN_ROLE) {
        require(fee <= MAX_PLATFORM_FEE, "Fee too high");
        platformFeePercentage = fee;
    }

    /**
     * @dev Admin function to pause the contract
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Admin function to unpause the contract
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @dev Emergency function to recover stuck tokens
     * @param token The token address to recover
     * @param amount The amount to recover
     */
    function emergencyTokenRecovery(address token, uint256 amount) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        IERC20(token).safeTransfer(msg.sender, amount);
    }
}
