import os
import json
import asyncio
from typing import Dict, Any, Optional
from web3 import Web3
from web3.middleware import ExtraDataToPOAMiddleware
from dotenv import load_dotenv

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_path = os.path.join(backend_dir, '.env')
load_dotenv(env_path, override=True)

class AlchemyDeployerService:
    def __init__(self):
        self.rpc_url = os.getenv("POLYGON_RPC_URL")
        self.private_key = os.getenv("PRIVATE_KEY")
        self.factory_contract_address = os.getenv("FACTORY_CONTRACT_ADDRESS")
        
        self.w3 = None
        self.account = None
        self.factory_contract = None
        self.connected = False
        
        if self.rpc_url:
            try:
                self.w3 = Web3(Web3.HTTPProvider(self.rpc_url))
                
                if self.w3.is_connected():
                    self.connected = True
                    self.w3.middleware_onion.inject(ExtraDataToPOAMiddleware, layer=0)
                    
                    if self.private_key:
                        self.account = self.w3.eth.account.from_key(self.private_key)
                    
                    if self.factory_contract_address:
                        self.load_factory_contract()
                else:
                    print("Warning: Could not connect to Polygon network")
            except Exception as e:
                print(f"Warning: Alchemy deployer initialization failed: {e}")
        else:
            print("Warning: POLYGON_RPC_URL not set - deployment features disabled")
    
    def load_factory_contract(self):
        try:
            app_dir = os.path.dirname(os.path.abspath(__file__))
            abi_path = os.path.join(app_dir, "PropertyEscrowFactory.json")
            
            if not os.path.exists(abi_path):
                project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
                abi_path = os.path.join(project_root, "artifacts", "contracts", "PropertyEscrowFactory.sol", "PropertyEscrowFactory.json")
            
            if os.path.exists(abi_path):
                with open(abi_path, "r") as f:
                    contract_json = json.load(f)
                    contract_abi = contract_json["abi"]
                
                self.factory_contract = self.w3.eth.contract(
                    address=self.factory_contract_address,
                    abi=contract_abi
                )
                print(f"Factory contract loaded successfully at {self.factory_contract_address}")
            else:
                print(f"Warning: Factory contract ABI not found at {abi_path}")
        except Exception as e:
            print(f"Warning: Could not load factory contract: {e}")
    
    async def deploy_property_contract(self, property_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Deploy a new property escrow contract using the factory pattern
        
        Args:
            property_data: Dictionary containing property information
            
        Returns:
            Dictionary with deployment result including contract address and transaction hash
        """
        if not self.connected or not self.factory_contract or not self.account:
            raise ValueError("Alchemy deployer not connected or factory contract not loaded")
        
        try:
            property_address = property_data.get("property_address", "")
            description = property_data.get("description", "")
            price = property_data.get("price", 0)
            metadata_uri = property_data.get("metadata_uri", "")
            
            if not property_address or price <= 0:
                raise ValueError("Invalid property data: address and price are required")
            
            function_call = self.factory_contract.functions.createPropertyEscrow(
                property_address,
                description,
                price,
                metadata_uri
            )
            
            gas_estimate = function_call.estimate_gas({'from': self.account.address})
            gas_limit = int(gas_estimate * 1.2)  # Add 20% buffer
            
            transaction = function_call.build_transaction({
                'from': self.account.address,
                'gas': gas_limit,
                'gasPrice': self.w3.to_wei('30', 'gwei'),  # Higher gas price for faster confirmation
                'nonce': self.w3.eth.get_transaction_count(self.account.address),
            })
            
            signed_txn = self.w3.eth.account.sign_transaction(transaction, self.private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.raw_transaction)
            
            print(f"Property contract deployment transaction sent: {tx_hash.hex()}")
            
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=300)
            
            if receipt.status == 1:
                contract_address = self.extract_contract_address_from_receipt(receipt)
                
                return {
                    "success": True,
                    "contract_address": contract_address,
                    "transaction_hash": tx_hash.hex(),
                    "block_number": receipt.blockNumber,
                    "gas_used": receipt.gasUsed
                }
            else:
                raise Exception("Transaction failed")
                
        except Exception as e:
            print(f"Error deploying property contract: {e}")
            return {
                "success": False,
                "error": str(e),
                "transaction_hash": None,
                "contract_address": None
            }
    
    def extract_contract_address_from_receipt(self, receipt) -> str:
        """
        Extract the deployed contract address from transaction receipt logs
        """
        try:
            for log in receipt.logs:
                try:
                    decoded_log = self.factory_contract.events.PropertyContractDeployed().process_log(log)
                    return decoded_log['args']['contractAddress']
                except:
                    continue
            
            for log in receipt.logs:
                if log.address and log.address != self.factory_contract_address:
                    return log.address
            
            raise Exception("Could not extract contract address from receipt")
            
        except Exception as e:
            print(f"Error extracting contract address: {e}")
            raise
    
    async def get_user_contracts(self, user_address: str) -> list:
        """
        Get all property contracts deployed by a specific user
        """
        if not self.connected or not self.factory_contract:
            raise ValueError("Factory contract not connected")
        
        try:
            contracts = self.factory_contract.functions.getUserContracts(user_address).call()
            return contracts
        except Exception as e:
            print(f"Error getting user contracts: {e}")
            return []
    
    async def get_property_info(self, contract_address: str) -> Dict[str, Any]:
        """
        Get property information for a specific contract
        """
        if not self.connected or not self.factory_contract:
            raise ValueError("Factory contract not connected")
        
        try:
            property_info = self.factory_contract.functions.getPropertyInfo(contract_address).call()
            return {
                "seller": property_info[0],
                "property_address": property_info[1],
                "price": property_info[2],
                "created_at": property_info[3],
                "is_active": property_info[4]
            }
        except Exception as e:
            print(f"Error getting property info: {e}")
            return {}
    
    async def grant_agent_role(self, agent_address: str) -> Dict[str, Any]:
        """
        Grant AGENT_ROLE to an address through the factory contract
        """
        if not self.connected or not self.factory_contract or not self.account:
            raise ValueError("Factory contract not connected or account not configured")
        
        try:
            function_call = self.factory_contract.functions.grantAgentRole(agent_address)
            
            transaction = function_call.build_transaction({
                'from': self.account.address,
                'gas': 100000,
                'gasPrice': self.w3.to_wei('20', 'gwei'),
                'nonce': self.w3.eth.get_transaction_count(self.account.address),
            })
            
            signed_txn = self.w3.eth.account.sign_transaction(transaction, self.private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.raw_transaction)
            
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
            
            return {
                "success": receipt.status == 1,
                "transaction_hash": tx_hash.hex(),
                "gas_used": receipt.gasUsed
            }
            
        except Exception as e:
            print(f"Error granting agent role: {e}")
            return {"success": False, "error": str(e)}
    
    def is_connected(self) -> bool:
        return self.connected and self.w3 is not None and self.factory_contract is not None

alchemy_deployer = AlchemyDeployerService()
