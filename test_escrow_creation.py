#!/usr/bin/env python3

import requests
import json
import time

def test_escrow_creation():
    """Test escrow creation to reproduce the nonce error"""
    
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
        "closing_date": 1751068800,
        "terms": "Payment in Full",
        "earnest_money": 6.0
    }
    
    print("🏠 Creating escrow transaction...")
    print(f"Data: {json.dumps(escrow_data, indent=2)}")
    
    try:
        response = requests.post(escrow_url, json=escrow_data, headers=headers)
        print(f"Response status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Escrow creation successful!")
            return True
        else:
            print(f"❌ Escrow creation failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Request failed: {e}")
        return False

def test_rapid_escrow_creation():
    """Test rapid escrow creation to trigger nonce collision"""
    
    login_url = "http://localhost:8000/auth/login"
    login_data = {
        "email": "admin@test.com", 
        "password": "admin123"
    }
    
    response = requests.post(login_url, json=login_data)
    if response.status_code != 200:
        print(f"❌ Login failed: {response.text}")
        return False
    
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    escrow_url = "http://localhost:8000/blockchain/escrow"
    
    for i in range(3):
        escrow_data = {
            "property_id": 3,
            "agent_address": "0xF331cB4C22a38616028B3A91F895d54DC85A4bd6",
            "inspection_days": 7,
            "closing_date": 1751068800,
            "terms": f"Payment in Full - Test {i+1}",
            "earnest_money": 6.0
        }
        
        print(f"\n🏠 Creating escrow transaction #{i+1}...")
        
        try:
            response = requests.post(escrow_url, json=escrow_data, headers=headers)
            print(f"Response status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Success: {result.get('transaction_hash', 'No hash')}")
            else:
                print(f"❌ Failed: {response.text}")
                
        except Exception as e:
            print(f"❌ Request failed: {e}")
        
        time.sleep(1)

if __name__ == "__main__":
    print("🧪 Testing escrow creation to reproduce nonce error...")
    
    print("\n=== Single Escrow Test ===")
    test_escrow_creation()
    
    print("\n=== Rapid Escrow Test ===")
    test_rapid_escrow_creation()
