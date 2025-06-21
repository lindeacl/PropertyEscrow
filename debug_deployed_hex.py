#!/usr/bin/env python3

import requests
import json
import time

def test_deployed_backend_directly():
    """Test deployed backend API directly to reproduce hex truncation"""
    
    deployed_login_url = "https://app-uxzqgdrr.fly.dev/auth/login"
    deployed_escrow_url = "https://app-uxzqgdrr.fly.dev/blockchain/escrow"
    
    login_data = {"email": "admin@propescrow.com", "password": "Vr&LITA4trwgzN3W"}
    
    print("🔐 Testing deployed backend login...")
    response = requests.post(deployed_login_url, json=login_data)
    if response.status_code != 200:
        print(f"❌ Deployed login failed: {response.text}")
        return False
    
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    escrow_data = {
        "property_id": 5,
        "agent_address": "0xF331cB4C22a38616028B3A91F895d54DC85A4bd6",
        "inspection_days": 7,
        "closing_date": 1751068800,
        "terms": "Payment in full upon closing. Standard residential purchase agreement.",
        "earnest_money": 7.0
    }
    
    print("🏠 Testing deployed escrow creation with exact failing data...")
    print(f"Data: {json.dumps(escrow_data, indent=2)}")
    
    try:
        response = requests.post(deployed_escrow_url, json=escrow_data, headers=headers)
        print(f"Deployed Response status: {response.status_code}")
        print(f"Deployed Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Deployed escrow creation successful!")
            return True
        else:
            print(f"❌ Deployed escrow creation failed: {response.text}")
            if "could not replace existing tx" in response.text or "INTERNAL_ERROR" in response.text:
                print("🎯 Confirmed: Deployed backend has hex encoding issue")
            return False
            
    except Exception as e:
        print(f"❌ Deployed request failed: {e}")
        return False

def compare_local_vs_deployed():
    """Compare local vs deployed backend responses"""
    
    print("\n=== Local Backend Test ===")
    local_success = test_local_backend()
    
    print("\n=== Deployed Backend Test ===")
    deployed_success = test_deployed_backend_directly()
    
    print(f"\n📊 Results:")
    print(f"Local backend: {'✅ Success' if local_success else '❌ Failed'}")
    print(f"Deployed backend: {'✅ Success' if deployed_success else '❌ Failed'}")
    
    if local_success and not deployed_success:
        print("🎯 Confirmed: Environment-specific hex encoding issue in deployed backend")
    
    return local_success, deployed_success

def test_local_backend():
    """Test local backend for comparison"""
    login_url = "http://localhost:8000/auth/login"
    escrow_url = "http://localhost:8000/blockchain/escrow"
    
    login_data = {"email": "admin@propescrow.com", "password": "Vr&LITA4trwgzN3W"}
    
    try:
        response = requests.post(login_url, json=login_data)
        if response.status_code != 200:
            print(f"❌ Local login failed: {response.text}")
            return False
        
        token = response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        escrow_data = {
            "property_id": 5,
            "agent_address": "0xF331cB4C22a38616028B3A91F895d54DC85A4bd6",
            "inspection_days": 7,
            "closing_date": 1751068800,
            "terms": "Payment in full upon closing. Standard residential purchase agreement.",
            "earnest_money": 7.0
        }
        
        response = requests.post(escrow_url, json=escrow_data, headers=headers)
        print(f"Local Response status: {response.status_code}")
        
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Local request failed: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Debugging Deployed vs Local Hex Encoding...")
    compare_local_vs_deployed()
