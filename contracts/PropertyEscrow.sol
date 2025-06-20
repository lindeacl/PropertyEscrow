// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract PropertyEscrow is AccessControl, ReentrancyGuard, Pausable {
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
        uint256 id;
        string propertyAddress;
        string description;
        uint256 price;
        address seller;
        bool isActive;
        string metadataURI;
    }
    
    struct EscrowTransaction {
        uint256 id;
        uint256 propertyId;
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
    
    mapping(uint256 => Property) public properties;
    mapping(uint256 => EscrowTransaction) public escrowTransactions;
    mapping(address => uint256[]) public userTransactions;
    
    uint256 public nextPropertyId = 1;
    uint256 public nextTransactionId = 1;
    
    event PropertyListed(uint256 indexed propertyId, address indexed seller, uint256 price);
    event EscrowCreated(uint256 indexed transactionId, uint256 indexed propertyId, address indexed buyer, address seller);
    event FundsDeposited(uint256 indexed transactionId, uint256 amount);
    event ApprovalGiven(uint256 indexed transactionId, address indexed approver, string role);
    event EscrowCompleted(uint256 indexed transactionId, uint256 amount);
    event EscrowCancelled(uint256 indexed transactionId, string reason);
    event DisputeRaised(uint256 indexed transactionId, address indexed raiser);
    event AdminOverride(uint256 indexed transactionId, address indexed admin, string action);
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }
    
    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), "Caller is not an admin");
        _;
    }
    
    modifier onlyAgent() {
        require(hasRole(AGENT_ROLE, msg.sender), "Caller is not an agent");
        _;
    }
    
    function listProperty(
        string memory _propertyAddress,
        string memory _description,
        uint256 _price,
        string memory _metadataURI
    ) external returns (uint256) {
        require(_price > 0, "Price must be greater than 0");
        
        uint256 propertyId = nextPropertyId++;
        
        properties[propertyId] = Property({
            id: propertyId,
            propertyAddress: _propertyAddress,
            description: _description,
            price: _price,
            seller: msg.sender,
            isActive: true,
            metadataURI: _metadataURI
        });
        
        emit PropertyListed(propertyId, msg.sender, _price);
        return propertyId;
    }
    
    function createEscrow(
        uint256 _propertyId,
        address _agent,
        uint256 _inspectionPeriodDays,
        uint256 _closingDateTimestamp,
        string memory _terms
    ) external payable returns (uint256) {
        Property storage property = properties[_propertyId];
        require(property.isActive, "Property is not active");
        require(property.seller != msg.sender, "Seller cannot be buyer");
        require(msg.value >= property.price / 100, "Earnest money must be at least 1% of purchase price");
        require(hasRole(AGENT_ROLE, _agent), "Agent must have AGENT_ROLE");
        
        uint256 transactionId = nextTransactionId++;
        
        escrowTransactions[transactionId] = EscrowTransaction({
            id: transactionId,
            propertyId: _propertyId,
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
        
        userTransactions[msg.sender].push(transactionId);
        userTransactions[property.seller].push(transactionId);
        userTransactions[_agent].push(transactionId);
        
        property.isActive = false;
        
        emit EscrowCreated(transactionId, _propertyId, msg.sender, property.seller);
        emit FundsDeposited(transactionId, msg.value);
        
        return transactionId;
    }
    
    function depositRemainingFunds(uint256 _transactionId) external payable nonReentrant {
        EscrowTransaction storage transaction = escrowTransactions[_transactionId];
        require(transaction.buyer == msg.sender, "Only buyer can deposit remaining funds");
        require(transaction.status == EscrowStatus.FundsDeposited, "Invalid status for deposit");
        
        uint256 remainingAmount = transaction.purchasePrice - transaction.earnestMoney;
        require(msg.value == remainingAmount, "Incorrect amount");
        
        transaction.status = EscrowStatus.ReadyToClose;
        emit FundsDeposited(_transactionId, msg.value);
    }
    
    function giveBuyerApproval(uint256 _transactionId) external {
        EscrowTransaction storage transaction = escrowTransactions[_transactionId];
        require(transaction.buyer == msg.sender, "Only buyer can give buyer approval");
        require(transaction.status == EscrowStatus.ReadyToClose, "Transaction not ready for approval");
        
        transaction.buyerApproval = true;
        emit ApprovalGiven(_transactionId, msg.sender, "BUYER");
        
        _checkForCompletion(_transactionId);
    }
    
    function giveSellerApproval(uint256 _transactionId) external {
        EscrowTransaction storage transaction = escrowTransactions[_transactionId];
        require(transaction.seller == msg.sender, "Only seller can give seller approval");
        require(transaction.status == EscrowStatus.ReadyToClose, "Transaction not ready for approval");
        
        transaction.sellerApproval = true;
        emit ApprovalGiven(_transactionId, msg.sender, "SELLER");
        
        _checkForCompletion(_transactionId);
    }
    
    function giveAgentApproval(uint256 _transactionId) external {
        EscrowTransaction storage transaction = escrowTransactions[_transactionId];
        require(transaction.agent == msg.sender, "Only assigned agent can give approval");
        require(transaction.status == EscrowStatus.ReadyToClose, "Transaction not ready for approval");
        
        transaction.agentApproval = true;
        emit ApprovalGiven(_transactionId, msg.sender, "AGENT");
        
        _checkForCompletion(_transactionId);
    }
    
    function _checkForCompletion(uint256 _transactionId) internal {
        EscrowTransaction storage transaction = escrowTransactions[_transactionId];
        
        if (transaction.buyerApproval && transaction.sellerApproval && transaction.agentApproval) {
            _completeEscrow(_transactionId);
        }
    }
    
    function _completeEscrow(uint256 _transactionId) internal nonReentrant {
        EscrowTransaction storage transaction = escrowTransactions[_transactionId];
        require(transaction.status == EscrowStatus.ReadyToClose, "Transaction not ready for completion");
        
        transaction.status = EscrowStatus.Completed;
        
        uint256 totalAmount = transaction.purchasePrice;
        payable(transaction.seller).transfer(totalAmount);
        
        emit EscrowCompleted(_transactionId, totalAmount);
    }
    
    function cancelEscrow(uint256 _transactionId, string memory _reason) external {
        _cancelEscrow(_transactionId, _reason);
    }
    
    function _cancelEscrow(uint256 _transactionId, string memory _reason) internal {
        EscrowTransaction storage transaction = escrowTransactions[_transactionId];
        require(
            transaction.buyer == msg.sender || 
            transaction.seller == msg.sender || 
            transaction.agent == msg.sender ||
            hasRole(ADMIN_ROLE, msg.sender),
            "Not authorized to cancel"
        );
        require(transaction.status != EscrowStatus.Completed, "Cannot cancel completed transaction");
        
        transaction.status = EscrowStatus.Cancelled;
        
        uint256 refundAmount = address(this).balance;
        if (refundAmount > 0) {
            payable(transaction.buyer).transfer(refundAmount);
        }
        
        Property storage property = properties[transaction.propertyId];
        property.isActive = true;
        
        emit EscrowCancelled(_transactionId, _reason);
    }
    
    function raiseDispute(uint256 _transactionId) external {
        EscrowTransaction storage transaction = escrowTransactions[_transactionId];
        require(
            transaction.buyer == msg.sender || 
            transaction.seller == msg.sender,
            "Only buyer or seller can raise dispute"
        );
        require(transaction.status != EscrowStatus.Completed, "Cannot dispute completed transaction");
        require(transaction.status != EscrowStatus.Cancelled, "Cannot dispute cancelled transaction");
        
        transaction.status = EscrowStatus.Disputed;
        emit DisputeRaised(_transactionId, msg.sender);
    }
    
    function adminOverride(uint256 _transactionId, string memory _action, bool _complete) external onlyAdmin {
        EscrowTransaction storage transaction = escrowTransactions[_transactionId];
        transaction.adminOverride = true;
        
        if (_complete) {
            _completeEscrow(_transactionId);
        } else {
            _cancelEscrow(_transactionId, "Admin override cancellation");
        }
        
        emit AdminOverride(_transactionId, msg.sender, _action);
    }
    
    function grantAgentRole(address _agent) external onlyAdmin {
        grantRole(AGENT_ROLE, _agent);
    }
    
    function revokeAgentRole(address _agent) external onlyAdmin {
        revokeRole(AGENT_ROLE, _agent);
    }
    
    function pause() external onlyAdmin {
        _pause();
    }
    
    function unpause() external onlyAdmin {
        _unpause();
    }
    
    function getProperty(uint256 _propertyId) external view returns (Property memory) {
        return properties[_propertyId];
    }
    
    function getEscrowTransaction(uint256 _transactionId) external view returns (EscrowTransaction memory) {
        return escrowTransactions[_transactionId];
    }
    
    function getUserTransactions(address _user) external view returns (uint256[] memory) {
        return userTransactions[_user];
    }
    
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
