#!/usr/bin/env python3

import sys
import os
import sqlite3

def debug_user_role_issue():
    """Debug why user role shows as Buyer instead of Admin"""
    
    print("=== Debugging User Role Issue ===")
    
    try:
        db_path = "backend/property_escrow.db"
        if not os.path.exists(db_path):
            print(f"❌ Database file not found: {db_path}")
            return False
        
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("\n=== User Role in Database ===")
        cursor.execute("SELECT id, email, username, role, is_active, is_verified FROM users WHERE email = 'admin@propescrow.com'")
        user = cursor.fetchone()
        
        if user:
            print(f"✅ User found: {user[1]}")
            print(f"ID: {user[0]}")
            print(f"Username: {user[2]}")
            print(f"Role in DB: '{user[3]}' (type: {type(user[3])})")
            print(f"is_active: {user[4]} (type: {type(user[4])})")
            print(f"is_verified: {user[5]} (type: {type(user[5])})")
            
            expected_roles = ['ADMIN', 'AGENT', 'BUYER', 'SELLER']
            if user[3] in expected_roles:
                print(f"✅ Role '{user[3]}' is valid")
            else:
                print(f"❌ Role '{user[3]}' is not in expected values: {expected_roles}")
            
            if user[3] == 'ADMIN':
                print("✅ Role is exactly 'ADMIN' (uppercase)")
            elif user[3] == 'admin':
                print("⚠️ Role is 'admin' (lowercase) - may need case conversion")
            else:
                print(f"❌ Role '{user[3]}' doesn't match expected 'ADMIN'")
                
        else:
            print("❌ User admin@propescrow.com not found")
        
        print("\n=== All Users and Roles ===")
        cursor.execute("SELECT email, username, role FROM users")
        all_users = cursor.fetchall()
        for u in all_users:
            print(f"  - {u[0]} ({u[1]}) -> Role: '{u[2]}'")
        
        print("\n=== Role Column Schema ===")
        cursor.execute("PRAGMA table_info(users)")
        columns = cursor.fetchall()
        for col in columns:
            if col[1] == 'role':
                print(f"Role column: {col[1]} {col[2]} (nullable: {not col[3]}, default: {col[4]})")
        
        conn.close()
        return user is not None
        
    except Exception as e:
        print(f"❌ Debug failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    debug_user_role_issue()
