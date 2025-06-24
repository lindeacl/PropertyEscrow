#!/usr/bin/env python3
"""Debug password verification for Railway admin authentication"""

import sys
import os
sys.path.append('backend')

from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
password = "wdbqHF@xt!5zc%8$"

print("=== Password Verification Debug ===")
print(f"Password: {password}")

hash1 = pwd_context.hash(password)
print(f"Generated hash: {hash1}")

verification_result = pwd_context.verify(password, hash1)
print(f"Verification result: {verification_result}")

print("\n=== Testing multiple hashes ===")
for i in range(3):
    test_hash = pwd_context.hash(password)
    test_verify = pwd_context.verify(password, test_hash)
    print(f"Hash {i+1}: {test_verify} - {test_hash[:60]}...")
