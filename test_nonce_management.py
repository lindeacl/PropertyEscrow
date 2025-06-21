#!/usr/bin/env python3

import sys
import os
sys.path.append('/home/ubuntu/property-escrow-system/backend')

from app.blockchain import blockchain_service

def test_nonce_management():
    """Test that nonce management prevents collisions"""
    print("Testing blockchain nonce management...")
    
    if not blockchain_service.is_connected():
        print("❌ Blockchain service not connected")
        return False
    
    print(f"✅ Blockchain service connected")
    print(f"✅ Account address: {blockchain_service.account.address if blockchain_service.account else 'None'}")
    
    try:
        nonce1 = blockchain_service._get_next_nonce()
        nonce2 = blockchain_service._get_next_nonce()
        nonce3 = blockchain_service._get_next_nonce()
        
        print(f"✅ Generated sequential nonces: {nonce1}, {nonce2}, {nonce3}")
        
        if nonce2 == nonce1 + 1 and nonce3 == nonce2 + 1:
            print("✅ Nonce sequencing working correctly")
            return True
        else:
            print("❌ Nonce sequencing failed - not sequential")
            return False
            
    except Exception as e:
        print(f"❌ Nonce generation failed: {e}")
        return False

def test_error_transformation():
    """Test error message transformation"""
    print("\nTesting error message transformation...")
    
    test_errors = [
        "INTERNAL_ERROR: could not replace existing tx",
        "nonce too low",
        "insufficient funds for gas * price + value"
    ]
    
    for error in test_errors:
        transformed = blockchain_service._transform_blockchain_error(error)
        print(f"  Original: {error}")
        print(f"  Transformed: {transformed}")
        print()

if __name__ == "__main__":
    print("🔧 Testing blockchain nonce management fixes...")
    print("=" * 50)
    
    success = test_nonce_management()
    test_error_transformation()
    
    if success:
        print("✅ Nonce management tests passed!")
        print("✅ The 'could not replace existing tx' error should be resolved")
    else:
        print("❌ Nonce management tests failed!")
        print("❌ May still experience transaction replacement errors")
    
    print("\n🚀 Ready to test escrow creation with fixed nonce management")
