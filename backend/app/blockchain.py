from web3 import Web3
from web3.middleware import ExtraDataToPOAMiddleware
import json
import os
import re
from typing import Dict, Any, Optional
from dotenv import load_dotenv

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_path = os.path.join(backend_dir, '.env')
load_dotenv(env_path, override=True)

class BlockchainService:
    def __init__(self):
        self.rpc_url = os.getenv("POLYGON_RPC_URL")
        self.private_key = os.getenv("PRIVATE_KEY")
        self.contract_address = os.getenv("CONTRACT_ADDRESS")
        
        self.w3 = None
        self.account = None
        self.contract = None
        self.connected = False
        self._pending_nonce = None
        
        if self.rpc_url:
            try:
                self.w3 = Web3(Web3.HTTPProvider(self.rpc_url))
                
                if self.w3.is_connected():
                    self.connected = True
                    self.w3.middleware_onion.inject(ExtraDataToPOAMiddleware, layer=0)
                    
                    if self.private_key:
                        self.account = self.w3.eth.account.from_key(self.private_key)
                    
                    if self.contract_address:
                        self.load_contract()
                else:
                    print("Warning: Could not connect to Polygon network")
            except Exception as e:
                print(f"Warning: Blockchain initialization failed: {e}")
        else:
            print("Warning: POLYGON_RPC_URL not set - blockchain features disabled")
    
    def load_contract(self):
        try:
            app_dir = os.path.dirname(os.path.abspath(__file__))
            abi_path = os.path.join(app_dir, "PropertyEscrow.json")
            
            if not os.path.exists(abi_path):
                project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
                abi_path = os.path.join(project_root, "artifacts", "contracts", "PropertyEscrow.sol", "PropertyEscrow.json")
            
            if os.path.exists(abi_path):
                with open(abi_path, "r") as f:
                    contract_json = json.load(f)
                    contract_abi = contract_json["abi"]
                
                self.contract = self.w3.eth.contract(
                    address=self.contract_address,
                    abi=contract_abi
                )
                print(f"Contract loaded successfully at {self.contract_address}")
            else:
                print(f"Warning: Contract ABI not found at {abi_path}")
        except Exception as e:
            print(f"Warning: Could not load contract: {e}")
    
    def get_balance(self, address: str) -> float:
        if not self.connected or not self.w3:
            raise ValueError("Blockchain not connected")
        balance_wei = self.w3.eth.get_balance(address)
        return self.w3.from_wei(balance_wei, 'ether')
    
    def _get_next_nonce(self) -> int:
        """Get the next available nonce, accounting for pending transactions"""
        if not self.connected or not self.w3 or not self.account:
            raise ValueError("Blockchain not connected or account not configured")
        
        network_nonce = self.w3.eth.get_transaction_count(self.account.address, 'pending')
        
        if self._pending_nonce is not None and self._pending_nonce >= network_nonce:
            self._pending_nonce += 1
        else:
            self._pending_nonce = network_nonce
        
        return self._pending_nonce

    def send_transaction(self, transaction_data: Dict[str, Any]) -> str:
        if not self.connected or not self.w3 or not self.account:
            raise ValueError("Blockchain not connected or account not configured")
        
        nonce = self._get_next_nonce()
        
        gas_price = self.w3.to_wei('25', 'gwei')
        
        transaction = {
            'from': self.account.address,
            'gas': 2000000,
            'gasPrice': gas_price,
            'nonce': nonce,
            **transaction_data
        }
        
        try:
            signed_txn = self.w3.eth.account.sign_transaction(transaction, self.private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.raw_transaction)
            return tx_hash.hex()
        except Exception as e:
            self._pending_nonce = None
            raise e
    
    def wait_for_transaction_receipt(self, tx_hash: str, timeout: int = 120):
        if not self.connected or not self.w3:
            raise ValueError("Blockchain not connected")
        return self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=timeout)
    
    def list_property(self, property_address: str, description: str, price: int, metadata_uri: str) -> str:
        if not self.connected or not self.contract or not self.account:
            raise ValueError("Blockchain not connected or contract/account not loaded")
        
        function_call = self.contract.functions.listProperty(
            property_address, description, price, metadata_uri
        )
        
        transaction = function_call.build_transaction({
            'from': self.account.address,
            'gas': 500000,
            'gasPrice': self.w3.to_wei('25', 'gwei'),
            'nonce': self._get_next_nonce(),
        })
        
        return self.send_transaction(transaction)
    
    def create_escrow(self, property_id: int, agent_address: str, inspection_days: int, 
                     closing_date: int, terms: str, earnest_money: float) -> str:
        if not self.connected or not self.contract or not self.account:
            raise ValueError("Blockchain not connected or contract/account not loaded")
        
        self._validate_escrow_inputs(property_id, agent_address, inspection_days, closing_date, terms, earnest_money)
        
        try:
            earnest_money_wei = self.w3.to_wei(earnest_money, 'ether')
            
            function_call = self.contract.functions.createEscrow(
                property_id, agent_address, inspection_days, closing_date, terms
            )
            
            transaction = function_call.build_transaction({
                'from': self.account.address,
                'value': earnest_money_wei,
                'gas': 800000,
                'gasPrice': self.w3.to_wei('25', 'gwei'),
                'nonce': self._get_next_nonce(),
            })
            
            return self.send_transaction(transaction)
        except Exception as e:
            error_message = self._transform_blockchain_error(str(e))
            raise ValueError(error_message)
    
    def get_property(self, property_id: int) -> Dict[str, Any]:
        if not self.connected or not self.contract:
            raise ValueError("Blockchain not connected or contract not loaded")
        
        result = self.contract.functions.getProperty(property_id).call()
        return {
            'id': result[0],
            'propertyAddress': result[1],
            'description': result[2],
            'price': result[3],
            'seller': result[4],
            'isActive': result[5],
            'metadataURI': result[6]
        }
    
    def get_escrow_transaction(self, transaction_id: int) -> Dict[str, Any]:
        if not self.connected or not self.contract:
            raise ValueError("Blockchain not connected or contract not loaded")
        
        result = self.contract.functions.getEscrowTransaction(transaction_id).call()
        return {
            'id': result[0],
            'propertyId': result[1],
            'buyer': result[2],
            'seller': result[3],
            'agent': result[4],
            'purchasePrice': result[5],
            'earnestMoney': result[6],
            'inspectionPeriodEnd': result[7],
            'closingDate': result[8],
            'status': result[9],
            'buyerApproval': result[10],
            'sellerApproval': result[11],
            'agentApproval': result[12],
            'adminOverride': result[13],
            'terms': result[14],
            'createdAt': result[15]
        }
    
    def give_approval(self, transaction_id: int, approval_type: str) -> str:
        if not self.connected or not self.contract or not self.account:
            raise ValueError("Blockchain not connected or contract/account not loaded")
        
        if approval_type == "buyer":
            function_call = self.contract.functions.giveBuyerApproval(transaction_id)
        elif approval_type == "seller":
            function_call = self.contract.functions.giveSellerApproval(transaction_id)
        elif approval_type == "agent":
            function_call = self.contract.functions.giveAgentApproval(transaction_id)
        else:
            raise ValueError("Invalid approval type")
        
        transaction = function_call.build_transaction({
            'from': self.account.address,
            'gas': 300000,
            'gasPrice': self.w3.to_wei('25', 'gwei'),
            'nonce': self._get_next_nonce(),
        })
        
        return self.send_transaction(transaction)
    
    def is_connected(self) -> bool:
        return self.connected and self.w3 is not None
    
    def _validate_escrow_inputs(self, property_id: int, agent_address: str, inspection_days: int, 
                               closing_date: int, terms: str, earnest_money: float):
        """Validate escrow inputs before blockchain interaction"""
        errors = []
        
        if property_id <= 0:
            errors.append("Property ID must be a positive number")
        
        if not agent_address:
            errors.append("Agent wallet address is required")
        elif not self._is_valid_ethereum_address(agent_address):
            errors.append("Agent wallet address must be a valid Ethereum address (0x followed by 40 characters)")
        
        if inspection_days <= 0:
            errors.append("Inspection days must be a positive number")
        
        if closing_date <= 0:
            errors.append("Closing date must be a valid timestamp")
        
        if not terms or len(terms.strip()) < 10:
            errors.append("Terms and conditions must be at least 10 characters long")
        
        if earnest_money <= 0:
            errors.append("Earnest money must be a positive amount")
        
        if errors:
            raise ValueError(". ".join(errors))
    
    def _is_valid_ethereum_address(self, address: str) -> bool:
        """Validate Ethereum address format"""
        if not address or not isinstance(address, str):
            return False
        
        if not re.match(r'^0x[a-fA-F0-9]{40}$', address):
            return False
        
        try:
            return self.w3.is_address(address)
        except:
            return True  # Fallback to regex validation
    
    def _transform_blockchain_error(self, error_message: str) -> str:
        """Transform technical blockchain errors into user-friendly messages"""
        error_lower = error_message.lower()
        
        if "abi not found" in error_lower or "argument" in error_lower and "not compatible" in error_lower:
            if "address" in error_lower:
                return "Invalid wallet address format. Please enter a valid Ethereum address starting with 0x followed by 40 characters."
        
        if "insufficient funds" in error_lower:
            return "Insufficient funds in your wallet to complete this transaction."
        
        if "gas" in error_lower and ("limit" in error_lower or "estimate" in error_lower):
            return "Transaction failed due to gas estimation issues. Please try again or contact support."
        
        if "nonce" in error_lower or "could not replace existing tx" in error_lower:
            return "Transaction ordering issue. Please wait a moment and try again."
        
        if "revert" in error_lower:
            return "Transaction was rejected by the smart contract. Please check your inputs and try again."
        
        return f"Transaction failed: {error_message}"

blockchain_service = BlockchainService()
