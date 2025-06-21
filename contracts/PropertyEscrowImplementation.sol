// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

contract PropertyEscrowImplementation is AccessControl, ReentrancyGuard, Pausable, Initializable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant AGENT_ROLE = keccak256("AGENT_ROLE");
    
    enum EscrowStatus {
        Created,
        FundsDeposited,
        InspectionPeriod,
        ReadyToClose,
        Completed,
        Cancelled,
        Disputed
    }
    
    struct Property {
        string propertyAddress;
        string description;
        uint256 price;
        address seller;
        bool isActive;
        string metadataURI;
        uint256 createdAt;
    }
    
    struct EscrowTransaction {
        uint256 id;
        address buyer;
        address seller;
        address agent;
        uint256 purchasePrice;
        uint256 earnestMoney;
        uint256 inspectionPeriodEnd;
        uint256 closingDate;
        EscrowStatus status;
        bool buyerApproval;
        bool sellerApproval;
        bool agentApproval;
        bool adminOverride;
        string terms;
        uint256 createdAt;
    }
    
    Property public property;
    EscrowTransaction public escrowTransaction;
    address public factory;
    bool public hasActiveEscrow;
    uint256 public nextTransactionId = 1;
    
    mapping(address => bool) public authorizedUsers;
    
    event PropertyInitialized(address indexed seller, string propertyAddress, uint256 price);
    event EscrowCreated(uint256 indexed transactionId, address indexed buyer, address seller);
    event FundsDeposited(uint256 indexed transactionId, uint256 amount);
    event ApprovalGiven(uint256 indexed transactionId, address indexed approver, string role);
    event EscrowCompleted(uint256 indexed transactionId, uint256 amount);
    event EscrowCancelled(uint256 indexed transactionId, string reason);
    event DisputeRaised(uint256 indexed transactionId, address indexed raiser);
    event AdminOverride(uint256 indexed transactionId, address indexed admin, string action);
    
    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), "Caller is not an admin");
        _;
    }
    
    modifier onlyAgent() {
        require(hasRole(AGENT_ROLE, msg.sender), "Caller is not an agent");
        _;
    }
    
    modifier onlyPropertySeller() {
        require(msg.sender == property.seller, "Only property seller can call this");
        _;
    }
    
    modifier onlyAuthorized() {
        require(
            msg.sender == property.seller ||
            msg.sender == escrowTransaction.buyer ||
            msg.sender == escrowTransaction.agent ||
            hasRole(ADMIN_ROLE, msg.sender),
            "Not authorized"
        );
        _;
    }
    
    function initialize(
        address _seller,
        string memory _propertyAddress,
        string memory _description,
        uint256 _price,
        string memory _metadataURI,
        address _admin,
        address _factory
    ) external initializer {
        require(_seller != address(0), "Seller cannot be zero address");
        require(_price > 0, "Price must be greater than 0");
        require(_factory != address(0), "Factory cannot be zero address");
        
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(ADMIN_ROLE, _admin);
        _grantRole(ADMIN_ROLE, _seller);
        
        factory = _factory;
        
        property = Property({
            propertyAddress: _propertyAddress,
            description: _description,
            price: _price,
            seller: _seller,
            isActive: true,
            metadataURI: _metadataURI,
            createdAt: block.timestamp
        });
        
        authorizedUsers[_seller] = true;
        
        emit PropertyInitialized(_seller, _propertyAddress, _price);
    }
    
    function createEscrow(
        address _agent,
        uint256 _inspectionPeriodDays,
        uint256 _closingDateTimestamp,
        string memory _terms
    ) external payable returns (uint256) {
        require(property.isActive, "Property is not active");
        require(!hasActiveEscrow, "Property already has active escrow");
        require(property.seller != msg.sender, "Seller cannot be buyer");
        require(msg.value >= property.price / 100, "Earnest money must be at least 1% of purchase price");
        
        // Check if agent has AGENT_ROLE from factory
        require(_isAgentAuthorized(_agent), "Agent must have AGENT_ROLE");
        
        uint256 transactionId = nextTransactionId++;
        
        escrowTransaction = EscrowTransaction({
            id: transactionId,
            buyer: msg.sender,
            seller: property.seller,
            agent: _agent,
            purchasePrice: property.price,
            earnestMoney: msg.value,
            inspectionPeriodEnd: block.timestamp + (_inspectionPeriodDays * 1 days),
            closingDate: _closingDateTimestamp,
            status: EscrowStatus.FundsDeposited,
            buyerApproval: false,
            sellerApproval: false,
            agentApproval: false,
            adminOverride: false,
            terms: _terms,
            createdAt: block.timestamp
        });
        
        hasActiveEscrow = true;
        property.isActive = false;
        
        authorizedUsers[msg.sender] = true;
        authorizedUsers[_agent] = true;
        
        emit EscrowCreated(transactionId, msg.sender, property.seller);
        emit FundsDeposited(transactionId, msg.value);
        
        return transactionId;
    }
    
    function depositRemainingFunds() external payable nonReentrant {
        require(hasActiveEscrow, "No active escrow");
        require(escrowTransaction.buyer == msg.sender, "Only buyer can deposit remaining funds");
        require(escrowTransaction.status == EscrowStatus.FundsDeposited, "Invalid status for deposit");
        
        uint256 remainingAmount = escrowTransaction.purchasePrice - escrowTransaction.earnestMoney;
        require(msg.value == remainingAmount, "Incorrect amount");
        
        escrowTransaction.status = EscrowStatus.ReadyToClose;
        emit FundsDeposited(escrowTransaction.id, msg.value);
    }
    
    function giveBuyerApproval() external {
        require(hasActiveEscrow, "No active escrow");
        require(escrowTransaction.buyer == msg.sender, "Only buyer can give buyer approval");
        require(escrowTransaction.status == EscrowStatus.ReadyToClose, "Transaction not ready for approval");
        
        escrowTransaction.buyerApproval = true;
        emit ApprovalGiven(escrowTransaction.id, msg.sender, "BUYER");
        
        _checkForCompletion();
    }
    
    function giveSellerApproval() external {
        require(hasActiveEscrow, "No active escrow");
        require(escrowTransaction.seller == msg.sender, "Only seller can give seller approval");
        require(escrowTransaction.status == EscrowStatus.ReadyToClose, "Transaction not ready for approval");
        
        escrowTransaction.sellerApproval = true;
        emit ApprovalGiven(escrowTransaction.id, msg.sender, "SELLER");
        
        _checkForCompletion();
    }
    
    function giveAgentApproval() external {
        require(hasActiveEscrow, "No active escrow");
        require(escrowTransaction.agent == msg.sender, "Only assigned agent can give approval");
        require(escrowTransaction.status == EscrowStatus.ReadyToClose, "Transaction not ready for approval");
        
        escrowTransaction.agentApproval = true;
        emit ApprovalGiven(escrowTransaction.id, msg.sender, "AGENT");
        
        _checkForCompletion();
    }
    
    function _checkForCompletion() internal {
        if (escrowTransaction.buyerApproval && escrowTransaction.sellerApproval && escrowTransaction.agentApproval) {
            _completeEscrow();
        }
    }
    
    function _completeEscrow() internal nonReentrant {
        require(escrowTransaction.status == EscrowStatus.ReadyToClose, "Transaction not ready for completion");
        
        escrowTransaction.status = EscrowStatus.Completed;
        hasActiveEscrow = false;
        
        uint256 totalAmount = address(this).balance;
        payable(escrowTransaction.seller).transfer(totalAmount);
        
        emit EscrowCompleted(escrowTransaction.id, totalAmount);
    }
    
    function cancelEscrow(string memory _reason) external onlyAuthorized {
        _cancelEscrow(_reason);
    }
    
    function raiseDispute() external {
        require(hasActiveEscrow, "No active escrow");
        require(
            escrowTransaction.buyer == msg.sender || 
            escrowTransaction.seller == msg.sender,
            "Only buyer or seller can raise dispute"
        );
        require(escrowTransaction.status != EscrowStatus.Completed, "Cannot dispute completed transaction");
        require(escrowTransaction.status != EscrowStatus.Cancelled, "Cannot dispute cancelled transaction");
        
        escrowTransaction.status = EscrowStatus.Disputed;
        emit DisputeRaised(escrowTransaction.id, msg.sender);
    }
    
    function adminOverride(string memory _action, bool _complete) external onlyAdmin {
        require(hasActiveEscrow, "No active escrow");
        escrowTransaction.adminOverride = true;
        
        if (_complete) {
            _completeEscrow();
        } else {
            _cancelEscrow("Admin override cancellation");
        }
        
        emit AdminOverride(escrowTransaction.id, msg.sender, _action);
    }
    
    function _cancelEscrow(string memory _reason) internal {
        require(hasActiveEscrow, "No active escrow");
        require(escrowTransaction.status != EscrowStatus.Completed, "Cannot cancel completed transaction");
        
        escrowTransaction.status = EscrowStatus.Cancelled;
        hasActiveEscrow = false;
        
        uint256 refundAmount = address(this).balance;
        if (refundAmount > 0) {
            payable(escrowTransaction.buyer).transfer(refundAmount);
        }
        
        property.isActive = true;
        
        emit EscrowCancelled(escrowTransaction.id, _reason);
    }
    
    function pause() external onlyAdmin {
        _pause();
    }
    
    function unpause() external onlyAdmin {
        _unpause();
    }
    
    function _isAgentAuthorized(address _agent) internal view returns (bool) {
        // Check if agent has AGENT_ROLE from factory contract
        try AccessControl(factory).hasRole(AGENT_ROLE, _agent) returns (bool hasRole) {
            return hasRole;
        } catch {
            return false;
        }
    }
    
    function getProperty() external view returns (Property memory) {
        return property;
    }
    
    function getEscrowTransaction() external view returns (EscrowTransaction memory) {
        return escrowTransaction;
    }
    
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    function isAuthorizedUser(address _user) external view returns (bool) {
        return authorizedUsers[_user];
    }
}
