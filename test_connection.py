#!/usr/bin/env python3
import os
from web3 import Web3
from dotenv import load_dotenv

load_dotenv("backend/.env")

def test_blockchain_connection():
    rpc_url = os.getenv("POLYGON_RPC_URL")
    private_key = os.getenv("PRIVATE_KEY")
    contract_address = os.getenv("CONTRACT_ADDRESS")
    
    print(f"RPC URL: {rpc_url}")
    print(f"Private Key: {private_key[:10]}..." if private_key else "Private Key: None")
    print(f"Contract Address: {contract_address}")
    
    try:
        w3 = Web3(Web3.HTTPProvider(rpc_url))
        print(f"Web3 instance created: {w3}")
        
        is_connected = w3.is_connected()
        print(f"Is connected: {is_connected}")
        
        if is_connected:
            print(f"Chain ID: {w3.eth.chain_id}")
            print(f"Latest block: {w3.eth.block_number}")
            
            if private_key:
                account = w3.eth.account.from_key(private_key)
                print(f"Account address: {account.address}")
                balance = w3.eth.get_balance(account.address)
                print(f"Account balance: {w3.from_wei(balance, 'ether')} ETH")
        else:
            print("Connection failed!")
            
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_blockchain_connection()
