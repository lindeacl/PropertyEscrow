#!/usr/bin/env python3

import sys
import os
import sqlite3

def fix_database_enum():
    """Fix the database enum issue by directly updating the role value"""
    
    print("=== Fixing Database Enum Issue ===")
    
    try:
        db_path = "backend/property_escrow.db"
        if not os.path.exists(db_path):
            print(f"❌ Database file not found: {db_path}")
            return False
        
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        cursor.execute("SELECT id, email, username, role FROM users")
        users = cursor.fetchall()
        
        print(f"Current users in database: {len(users)}")
        for user in users:
            print(f"- ID: {user[0]}, Email: {user[1]}, Username: {user[2]}, Role: {user[3]}")
        
        cursor.execute("UPDATE users SET role = 'ADMIN' WHERE role = 'admin'")
        updated_count = cursor.rowcount
        
        if updated_count > 0:
            print(f"✅ Updated {updated_count} user(s) from 'admin' to 'ADMIN' role")
        else:
            print("ℹ️ No users with 'admin' role found to update")
        
        cursor.execute("SELECT id, email FROM users WHERE role = 'ADMIN'")
        admin_users = cursor.fetchall()
        
        if admin_users:
            admin_id = admin_users[0][0]
            current_email = admin_users[0][1]
            
            if current_email != 'admin@propescrow.com':
                print(f"Updating admin email from {current_email} to admin@propescrow.com")
                cursor.execute("UPDATE users SET email = ? WHERE id = ?", ('admin@propescrow.com', admin_id))
            
            from backend.app.auth import get_password_hash
            new_password_hash = get_password_hash('siqfi2-kofgoz-Cikdab')
            cursor.execute("UPDATE users SET hashed_password = ? WHERE id = ?", (new_password_hash, admin_id))
            print("✅ Updated admin password")
        
        conn.commit()
        
        cursor.execute("SELECT id, email, username, role FROM users")
        users_after = cursor.fetchall()
        
        print("\nUsers after fix:")
        for user in users_after:
            print(f"- ID: {user[0]}, Email: {user[1]}, Username: {user[2]}, Role: {user[3]}")
        
        conn.close()
        
        print("✅ Database enum issue fixed successfully")
        return True
        
    except Exception as e:
        print(f"❌ Database fix failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    sys.path.append('backend')
    fix_database_enum()
