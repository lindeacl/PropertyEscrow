#!/usr/bin/env python3

import sqlite3
import os
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def fix_admin_user():
    """Fix admin user with correct ADMIN enum value"""
    db_path = os.path.join(os.path.dirname(__file__), 'backend', 'property_escrow.db')
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM users WHERE email = ?', ('admin@test.com',))
        deleted_count = cursor.rowcount
        if deleted_count > 0:
            print(f'🗑️ Deleted existing admin user (had enum issue)')
        
        print('✅ Creating admin user with correct ADMIN enum and bcrypt hash...')
        password_hash = pwd_context.hash('admin123')
        cursor.execute('''
            INSERT INTO users (email, username, hashed_password, full_name, role, is_active)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', ('admin@test.com', 'admin', password_hash, 'Admin User', 'ADMIN', True))
        conn.commit()
        print('✅ Admin user created successfully with correct ADMIN enum')
        
        conn.close()
        return True
        
    except Exception as e:
        print(f'❌ Error fixing admin user: {e}')
        return False

if __name__ == "__main__":
    print("🔧 Fixing admin user enum issue...")
    success = fix_admin_user()
    if success:
        print("🚀 Ready to test escrow creation with fixed admin credentials")
    else:
        print("💥 Failed to fix admin user")
