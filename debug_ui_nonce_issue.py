#!/usr/bin/env python3

import requests
import json
import time
import threading
from concurrent.futures import ThreadPoolExecutor

def test_ui_escrow_flow():
    """Test the exact UI escrow creation flow to debug nonce issues"""
    
    login_url = "http://localhost:8000/auth/login"
    login_data = {
        "email": "admin@test.com",
        "password": "admin123"
    }
    
    print("🔐 Logging in...")
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
        "closing_date": 1751068800,  # 2025-06-27
        "terms": "Payment in full",
        "earnest_money": 7.0  # 7 ETH as shown in screenshot
    }
    
    print("🏠 Creating escrow with exact UI data...")
    print(f"Data: {json.dumps(escrow_data, indent=2)}")
    
    try:
        response = requests.post(escrow_url, json=escrow_data, headers=headers)
        print(f"Response status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ UI escrow creation successful!")
            return True
        else:
            print(f"❌ UI escrow creation failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Request failed: {e}")
        return False

def test_concurrent_ui_escrows():
    """Test concurrent escrow creation to trigger nonce conflicts"""
    
    def create_escrow(thread_id):
        login_url = "http://localhost:8000/auth/login"
        login_data = {
            "email": "admin@test.com",
            "password": "admin123"
        }
        
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
            "terms": f"Payment in full - Thread {thread_id}",
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
    
    print("\n🚀 Testing concurrent escrow creation (simulating UI rapid clicks)...")
    
    with ThreadPoolExecutor(max_workers=3) as executor:
        futures = [executor.submit(create_escrow, i+1) for i in range(3)]
        results = [future.result() for future in futures]
    
    success_count = sum(results)
    print(f"\n📊 Results: {success_count}/3 escrows created successfully")
    return success_count == 3

if __name__ == "__main__":
    print("🧪 Debugging UI nonce management issue...")
    
    print("\n=== Single UI Escrow Test ===")
    single_success = test_ui_escrow_flow()
    
    print("\n=== Concurrent UI Escrow Test ===")
    concurrent_success = test_concurrent_ui_escrows()
    
    if single_success and concurrent_success:
        print("\n✅ All tests passed - nonce management working correctly")
    else:
        print("\n❌ Tests failed - nonce management issue persists")
        print("Check backend logs for nonce debugging information")
