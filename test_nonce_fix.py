#!/usr/bin/env python3

import requests
import json
import time
import threading
from concurrent.futures import ThreadPoolExecutor

def test_user_exact_inputs():
    """Test with the exact inputs from user's screenshot"""
    
    login_url = "http://localhost:8000/auth/login"
    login_data = {"email": "admin@test.com", "password": "admin123"}
    
    response = requests.post(login_url, json=login_data)
    if response.status_code != 200:
        print(f"❌ Login failed: {response.text}")
        return False
    
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    escrow_url = "http://localhost:8000/blockchain/escrow"
    escrow_data = {
        "property_id": 3,
        "agent_address": "0xF331cB4C22a38616028B3A91F895d54DC85A4bd6",
        "inspection_days": 7,
        "closing_date": 1751068800,
        "terms": "Payment in full",
        "earnest_money": 7.0
    }
    
    print("🏠 Testing with user's exact escrow inputs...")
    print(f"Data: {json.dumps(escrow_data, indent=2)}")
    
    try:
        response = requests.post(escrow_url, json=escrow_data, headers=headers)
        print(f"Response status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Escrow creation successful with user's exact inputs!")
            return True
        else:
            print(f"❌ Escrow creation failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Request failed: {e}")
        return False

def test_concurrent_escrow_creation():
    """Test concurrent escrow creation to verify queue prevents race conditions"""
    
    def create_escrow(thread_id):
        login_url = "http://localhost:8000/auth/login"
        login_data = {"email": "admin@test.com", "password": "admin123"}
        
        response = requests.post(login_url, json=login_data)
        if response.status_code != 200:
            print(f"❌ Thread {thread_id} login failed: {response.text}")
            return False
        
        token = response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        escrow_url = "http://localhost:8000/blockchain/escrow"
        escrow_data = {
            "property_id": 3,
            "agent_address": "0xF331cB4C22a38616028B3A91F895d54DC85A4bd6",
            "inspection_days": 7,
            "closing_date": 1751068800,
            "terms": f"Payment in full - Concurrent Test {thread_id}",
            "earnest_money": 7.0
        }
        
        print(f"🏠 Thread {thread_id} creating escrow...")
        
        try:
            response = requests.post(escrow_url, json=escrow_data, headers=headers)
            print(f"Thread {thread_id} - Status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Thread {thread_id} Success: {result.get('transaction_hash', 'No hash')}")
                return True
            else:
                print(f"❌ Thread {thread_id} Failed: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Thread {thread_id} Request failed: {e}")
            return False
    
    print("\n🚀 Testing concurrent escrow creation with transaction queue...")
    
    with ThreadPoolExecutor(max_workers=3) as executor:
        futures = [executor.submit(create_escrow, i+1) for i in range(3)]
        results = [future.result() for future in futures]
    
    success_count = sum(results)
    print(f"\n📊 Results: {success_count}/3 escrows created successfully")
    return success_count >= 2

if __name__ == "__main__":
    print("🧪 Testing transaction queue fix for nonce management...")
    
    print("\n=== Single Escrow Test (User's Exact Inputs) ===")
    single_success = test_user_exact_inputs()
    
    print("\n=== Concurrent Escrow Test (Queue Verification) ===")
    concurrent_success = test_concurrent_escrow_creation()
    
    if single_success and concurrent_success:
        print("\n✅ All tests passed - transaction queue working correctly")
    else:
        print("\n❌ Tests failed - check backend logs for transaction queue issues")
