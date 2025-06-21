#!/usr/bin/env python3

import sys
import os
import sqlite3

def fix_user_boolean_fields():
    """Fix the database boolean fields that are causing validation errors"""
    
    print("=== Fixing User Boolean Fields ===")
    
    try:
        db_path = "backend/property_escrow.db"
        if not os.path.exists(db_path):
            print(f"❌ Database file not found: {db_path}")
            return False
        
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        cursor.execute("SELECT id, email, is_active, is_verified FROM users")
        users = cursor.fetchall()
        
        print(f"Current users in database: {len(users)}")
        for user in users:
            print(f"- ID: {user[0]}, Email: {user[1]}, is_active: {user[2]}, is_verified: {user[3]}")
        
        cursor.execute("UPDATE users SET is_active = 1, is_verified = 1 WHERE email = 'admin@propescrow.com'")
        updated_count = cursor.rowcount
        
        if updated_count > 0:
            print(f"✅ Updated {updated_count} user(s) boolean fields")
        else:
            print("ℹ️ No users found to update")
        
        conn.commit()
        
        cursor.execute("SELECT id, email, is_active, is_verified FROM users")
        users_after = cursor.fetchall()
        
        print("\nUsers after fix:")
        for user in users_after:
            print(f"- ID: {user[0]}, Email: {user[1]}, is_active: {user[2]}, is_verified: {user[3]}")
        
        conn.close()
        
        print("✅ User boolean fields fixed successfully")
        return True
        
    except Exception as e:
        print(f"❌ Database fix failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    fix_user_boolean_fields()
