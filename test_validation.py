#!/usr/bin/env python3

import sys
import os
sys.path.append('/home/ubuntu/property-escrow-system/backend')

from app.blockchain import blockchain_service

def test_address_validation():
    """Test Ethereum address validation"""
    print("Testing Ethereum address validation...")
    
    valid_addresses = [
        "0x1234567890123456789012345678901234567890",
        "0xabcdefABCDEF1234567890123456789012345678",
        "0x0000000000000000000000000000000000000000"
    ]
    
    for addr in valid_addresses:
        result = blockchain_service._is_valid_ethereum_address(addr)
        print(f"  {addr}: {'✓' if result else '✗'} {'VALID' if result else 'INVALID'}")
    
    invalid_addresses = [
        "0x123456789001425345",  # Too short (original error case)
        "1234567890123456789012345678901234567890",  # Missing 0x
        "0x123456789012345678901234567890123456789G",  # Invalid character
        "0x12345678901234567890123456789012345678901",  # Too long
        "",  # Empty
        None  # None
    ]
    
    for addr in invalid_addresses:
        result = blockchain_service._is_valid_ethereum_address(addr)
        print(f"  {addr}: {'✓' if result else '✗'} {'VALID' if result else 'INVALID'}")

def test_error_transformation():
    """Test blockchain error message transformation"""
    print("\nTesting error message transformation...")
    
    test_errors = [
        "ABI Not Found! Found 1 element(s) named `createEscrow` that accept 5 argument(s). The provided arguments are not valid. Provided argument types: (int,str,int,int,str) Provided keyword argument types: {} Tried to find a matching ABI element named `createEscrow`, but encountered the following problems: Signature: createEscrow(uint256,address,uint256,uint256,string), type: function Argument 1 value `2` is valid. Argument 2 value `0x123456789001425345` is not compatible with type `address`. Argument 3 value `7` is valid. Argument 4 value `1750982400` is valid. Argument 5 value `Payment in full` is valid.",
        "insufficient funds for gas * price + value",
        "gas required exceeds allowance",
        "nonce too low",
        "execution reverted: Invalid property ID"
    ]
    
    for error in test_errors:
        transformed = blockchain_service._transform_blockchain_error(error)
        print(f"  Original: {error[:80]}...")
        print(f"  Transformed: {transformed}")
        print()

def test_escrow_validation():
    """Test escrow input validation"""
    print("Testing escrow input validation...")
    
    test_cases = [
        {
            "name": "Invalid agent address (too short)",
            "data": (1, "0x123456789001425345", 7, 1750982400, "Valid terms here", 0.1)
        },
        {
            "name": "Negative property ID",
            "data": (-1, "0x1234567890123456789012345678901234567890", 7, 1750982400, "Valid terms here", 0.1)
        },
        {
            "name": "Zero inspection days",
            "data": (1, "0x1234567890123456789012345678901234567890", 0, 1750982400, "Valid terms here", 0.1)
        },
        {
            "name": "Short terms",
            "data": (1, "0x1234567890123456789012345678901234567890", 7, 1750982400, "Short", 0.1)
        },
        {
            "name": "Zero earnest money",
            "data": (1, "0x1234567890123456789012345678901234567890", 7, 1750982400, "Valid terms here", 0)
        }
    ]
    
    for test_case in test_cases:
        try:
            blockchain_service._validate_escrow_inputs(*test_case["data"])
            print(f"  {test_case['name']}: ✗ FAILED (should have raised error)")
        except ValueError as e:
            print(f"  {test_case['name']}: ✓ PASSED - {str(e)}")
        except Exception as e:
            print(f"  {test_case['name']}: ✗ UNEXPECTED ERROR - {str(e)}")

if __name__ == "__main__":
    test_address_validation()
    test_error_transformation()
    test_escrow_validation()
    print("\nValidation testing complete!")
