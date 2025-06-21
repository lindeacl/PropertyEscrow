#!/usr/bin/env python3

import sys
import os
sys.path.append('backend')

from backend.app.blockchain import blockchain_service

def test_blockchain_connection():
    """Test blockchain service connection and environment detection"""
    
    print(f"=== Blockchain Service Status ===")
    print(f"Environment: {blockchain_service.environment}")
    print(f"Is deployed: {blockchain_service.is_deployed}")
    print(f"Connected: {blockchain_service.is_connected()}")
    print(f"RPC URL: {blockchain_service.rpc_url}")
    print(f"Account: {blockchain_service.account.address if blockchain_service.account else None}")
    print(f"Contract: {blockchain_service.contract_address}")
    
    if blockchain_service.is_connected():
        print("✅ Blockchain service connected successfully")
        return True
    else:
        print("❌ Blockchain service connection failed")
        return False

if __name__ == "__main__":
    test_blockchain_connection()
