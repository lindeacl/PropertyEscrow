#!/usr/bin/env python3

import sqlite3
import hashlib
import os

def setup_admin_user():
    """Create admin user in the local database for testing"""
    db_path = os.path.join(os.path.dirname(__file__), 'backend', 'property_escrow.db')
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM users WHERE email = ?', ('admin@test.com',))
        user = cursor.fetchone()
        
        if user:
            print('✅ Admin user already exists:', user)
        else:
            print('❌ Admin user does not exist. Creating...')
            password_hash = hashlib.sha256('admin123'.encode()).hexdigest()
            cursor.execute('''
                INSERT INTO users (email, username, hashed_password, full_name, role, is_active)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', ('admin@test.com', 'admin', password_hash, 'Admin User', 'ADMIN', True))
            conn.commit()
            print('✅ Admin user created successfully')
        
        conn.close()
        return True
        
    except Exception as e:
        print(f'❌ Error setting up admin user: {e}')
        return False

if __name__ == "__main__":
    print("🔧 Setting up admin user for testing...")
    success = setup_admin_user()
    if success:
        print("🚀 Ready to test escrow creation with admin credentials")
    else:
        print("💥 Failed to setup admin user")
