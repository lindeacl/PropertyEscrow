#!/usr/bin/env python3

import sys
import os
sys.path.append('backend')

from backend.app.blockchain import blockchain_service
from web3 import Web3
import requests
import json
import threading
import time

def debug_transaction_building():
    """Debug transaction building and hex encoding in isolation"""
    
    print('=== Testing Transaction Building Process ===')
    print(f'Blockchain connected: {blockchain_service.is_connected()}')
    print(f'Account address: {blockchain_service.account.address if blockchain_service.account else None}')
    print(f'Contract address: {blockchain_service.contract_address}')
    print(f'Web3 provider: {blockchain_service.w3.provider if blockchain_service.w3 else None}')
    
    if not blockchain_service.contract or not blockchain_service.account:
        print('❌ Contract or account not loaded')
        return False
    
    try:
        earnest_money_wei = blockchain_service.w3.to_wei(7.0, 'ether')
        
        function_call = blockchain_service.contract.functions.createEscrow(
            3, '0xF331cB4C22a38616028B3A91F895d54DC85A4bd6', 7, 1751068800, 'Payment in full'
        )
        
        nonce = blockchain_service.w3.eth.get_transaction_count(blockchain_service.account.address, 'pending')
        
        transaction = function_call.build_transaction({
            'from': blockchain_service.account.address,
            'value': earnest_money_wei,
            'gas': 800000,
            'gasPrice': blockchain_service.w3.to_wei('25', 'gwei'),
            'nonce': nonce,
        })
        
        print(f'\n=== Transaction Data Analysis ===')
        for key, value in transaction.items():
            if isinstance(value, str) and value.startswith('0x'):
                print(f'{key}: {value} (length: {len(value)}, even: {len(value) % 2 == 0})')
            else:
                print(f'{key}: {value} (type: {type(value)})')
        
        if 'chainId' not in transaction:
            transaction['chainId'] = 137
        
        print(f'\n=== Transaction Signing Analysis ===')
        signed_txn = blockchain_service.w3.eth.account.sign_transaction(transaction, blockchain_service.private_key)
        raw_hex = signed_txn.raw_transaction.hex()
        
        print(f'Raw transaction hex length: {len(raw_hex)} characters')
        print(f'Raw transaction even length: {len(raw_hex) % 2 == 0}')
        print(f'Raw transaction first 100 chars: {raw_hex[:100]}')
        print(f'Raw transaction last 100 chars: {raw_hex[-100:]}')
        
        print(f'\n=== Alchemy Request Simulation ===')
        alchemy_hex = f'0x{raw_hex}' if not raw_hex.startswith('0x') else raw_hex
        print(f'Alchemy hex string: {alchemy_hex[:100]}...')
        print(f'Alchemy hex length: {len(alchemy_hex)}')
        print(f'Alchemy hex even: {len(alchemy_hex) % 2 == 0}')
        
        return len(alchemy_hex) % 2 == 0
        
    except Exception as e:
        print(f'❌ Transaction building failed: {e}')
        import traceback
        traceback.print_exc()
        return False

def test_concurrent_api_calls():
    """Test concurrent API calls to reproduce UI behavior"""
    
    def make_escrow_request(thread_id):
        login_url = "http://localhost:8000/auth/login"
        login_data = {"email": "admin@test.com", "password": "admin123"}
        
        response = requests.post(login_url, json=login_data)
        if response.status_code != 200:
            print(f'❌ Thread {thread_id} login failed')
            return False
        
        token = response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        escrow_url = "http://localhost:8000/blockchain/escrow"
        escrow_data = {
            "property_id": 3,
            "agent_address": "0xF331cB4C22a38616028B3A91F895d54DC85A4bd6",
            "inspection_days": 7,
            "closing_date": 1751068800,
            "terms": f"Payment in full - Concurrent {thread_id}",
            "earnest_money": 7.0
        }
        
        print(f'🏠 Thread {thread_id} making escrow request...')
        
        try:
            response = requests.post(escrow_url, json=escrow_data, headers=headers)
            print(f'Thread {thread_id} - Status: {response.status_code}')
            print(f'Thread {thread_id} - Response: {response.text[:200]}...')
            
            return response.status_code == 200
        except Exception as e:
            print(f'❌ Thread {thread_id} Request failed: {e}')
            return False
    
    print('\n🚀 Testing concurrent API calls (simulating UI rapid clicks)...')
    
    threads = []
    results = []
    
    def thread_wrapper(thread_id):
        result = make_escrow_request(thread_id)
        results.append(result)
    
    for i in range(3):
        thread = threading.Thread(target=thread_wrapper, args=(i+1,))
        threads.append(thread)
        thread.start()
        time.sleep(0.1)  # Small delay to simulate UI timing
    
    for thread in threads:
        thread.join()
    
    success_count = sum(results)
    print(f'\n📊 Concurrent Results: {success_count}/3 requests successful')
    return success_count >= 1

if __name__ == "__main__":
    print("🧪 Debugging Transaction Hex Encoding Issues...")
    
    building_ok = debug_transaction_building()
    
    if building_ok:
        print("\n✅ Transaction building produces even-length hex")
        concurrent_ok = test_concurrent_api_calls()
        
        if not concurrent_ok:
            print("\n❌ Concurrent API calls failed - issue may be in request processing")
        else:
            print("\n✅ Concurrent API calls work - issue may be UI-specific")
    else:
        print("\n❌ Transaction building produces odd-length hex - found root cause")
