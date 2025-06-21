// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IPropertyEscrowImplementation {
    function initialize(
        address _seller,
        string memory _propertyAddress,
        string memory _description,
        uint256 _price,
        string memory _metadataURI,
        address _admin,
        address _factory
    ) external;
}

contract PropertyEscrowFactory is AccessControl, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant AGENT_ROLE = keccak256("AGENT_ROLE");
    
    address public immutable implementation;
    address[] public deployedContracts;
    mapping(address => address[]) public userContracts;
    mapping(address => PropertyInfo) public contractToProperty;
    
    struct PropertyInfo {
        address seller;
        string propertyAddress;
        uint256 price;
        uint256 createdAt;
        bool isActive;
    }
    
    event PropertyContractDeployed(
        address indexed contractAddress,
        address indexed seller,
        string propertyAddress,
        uint256 price
    );
    
    event AgentRoleGranted(address indexed agent, address indexed admin);
    event AgentRoleRevoked(address indexed agent, address indexed admin);
    
    constructor(address _implementation) {
        require(_implementation != address(0), "Implementation cannot be zero address");
        implementation = _implementation;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }
    
    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), "Caller is not an admin");
        _;
    }
    
    function createPropertyEscrow(
        string memory _propertyAddress,
        string memory _description,
        uint256 _price,
        string memory _metadataURI
    ) external nonReentrant returns (address) {
        require(_price > 0, "Price must be greater than 0");
        require(bytes(_propertyAddress).length > 0, "Property address cannot be empty");
        
        address clone = Clones.clone(implementation);
        
        IPropertyEscrowImplementation(clone).initialize(
            msg.sender,
            _propertyAddress,
            _description,
            _price,
            _metadataURI,
            msg.sender, // Grant admin role to property creator initially
            address(this)
        );
        
        deployedContracts.push(clone);
        userContracts[msg.sender].push(clone);
        
        contractToProperty[clone] = PropertyInfo({
            seller: msg.sender,
            propertyAddress: _propertyAddress,
            price: _price,
            createdAt: block.timestamp,
            isActive: true
        });
        
        emit PropertyContractDeployed(clone, msg.sender, _propertyAddress, _price);
        
        return clone;
    }
    
    function grantAgentRole(address _agent) external onlyAdmin {
        grantRole(AGENT_ROLE, _agent);
        emit AgentRoleGranted(_agent, msg.sender);
    }
    
    function revokeAgentRole(address _agent) external onlyAdmin {
        revokeRole(AGENT_ROLE, _agent);
        emit AgentRoleRevoked(_agent, msg.sender);
    }
    
    function isAgent(address _address) external view returns (bool) {
        return hasRole(AGENT_ROLE, _address);
    }
    
    function getDeployedContracts() external view returns (address[] memory) {
        return deployedContracts;
    }
    
    function getUserContracts(address _user) external view returns (address[] memory) {
        return userContracts[_user];
    }
    
    function getPropertyInfo(address _contract) external view returns (PropertyInfo memory) {
        return contractToProperty[_contract];
    }
    
    function getTotalDeployedContracts() external view returns (uint256) {
        return deployedContracts.length;
    }
    
    function predictDeterministicAddress(bytes32 _salt) external view returns (address) {
        return Clones.predictDeterministicAddress(implementation, _salt, address(this));
    }
    
    function createPropertyEscrowDeterministic(
        string memory _propertyAddress,
        string memory _description,
        uint256 _price,
        string memory _metadataURI,
        bytes32 _salt
    ) external nonReentrant returns (address) {
        require(_price > 0, "Price must be greater than 0");
        require(bytes(_propertyAddress).length > 0, "Property address cannot be empty");
        
        address clone = Clones.cloneDeterministic(implementation, _salt);
        
        IPropertyEscrowImplementation(clone).initialize(
            msg.sender,
            _propertyAddress,
            _description,
            _price,
            _metadataURI,
            msg.sender,
            address(this)
        );
        
        deployedContracts.push(clone);
        userContracts[msg.sender].push(clone);
        
        contractToProperty[clone] = PropertyInfo({
            seller: msg.sender,
            propertyAddress: _propertyAddress,
            price: _price,
            createdAt: block.timestamp,
            isActive: true
        });
        
        emit PropertyContractDeployed(clone, msg.sender, _propertyAddress, _price);
        
        return clone;
    }
}
