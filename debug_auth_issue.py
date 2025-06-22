#!/usr/bin/env python3

import sys
import os
import sqlite3

def debug_authentication_issue():
    """Debug why authentication is failing after model changes"""
    
    print("=== Debugging Authentication Issue ===")
    
    try:
        db_path = "backend/property_escrow.db"
        if not os.path.exists(db_path):
            print(f"❌ Database file not found: {db_path}")
            return False
        
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("\n=== Checking User Table ===")
        cursor.execute("SELECT email, username, role, is_active, is_verified, hashed_password FROM users WHERE email = 'admin@propescrow.com'")
        user = cursor.fetchone()
        
        if user:
            print(f"✅ User found: {user[0]}")
            print(f"Username: {user[1]}")
            print(f"Role: {user[2]}")
            print(f"is_active: {user[3]} (type: {type(user[3])})")
            print(f"is_verified: {user[4]} (type: {type(user[4])})")
            print(f"Password hash: {user[5][:50]}...")
            
            sys.path.append('backend')
            from app.auth import verify_password
            
            test_password = "wdbqHF@xt!5zc%8$"
            is_valid = verify_password(test_password, user[5])
            print(f"Password verification result: {is_valid}")
            
            if not is_valid:
                print("❌ Password verification failed - this explains the auth issue")
                
                alt_passwords = ["wdbqHF@xt!5zc%8$", "admin123", "password"]
                for alt_pass in alt_passwords:
                    if verify_password(alt_pass, user[5]):
                        print(f"✅ Correct password found: {alt_pass}")
                        break
                else:
                    print("❌ None of the test passwords work")
            else:
                print("✅ Password verification successful")
                
        else:
            print("❌ User admin@propescrow.com not found")
            
            cursor.execute("SELECT email, username, role FROM users")
            all_users = cursor.fetchall()
            print(f"\nAll users in database:")
            for u in all_users:
                print(f"  - {u[0]} ({u[1]}, {u[2]})")
        
        conn.close()
        return user is not None
        
    except Exception as e:
        print(f"❌ Debug failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    debug_authentication_issue()
