#!/usr/bin/env python3

import sys
import os
sys.path.append('backend')

from backend.app.database import get_db
from backend.app.models import User
from backend.app.auth import get_password_hash, verify_password

def list_and_update_users():
    """List existing users and update admin credentials if needed"""
    
    print("=== Current Database Users ===")
    
    try:
        db = next(get_db())
        
        all_users = db.query(User).all()
        print(f"Total users in database: {len(all_users)}")
        
        for user in all_users:
            print(f"- ID: {user.id}")
            print(f"  Email: {user.email}")
            print(f"  Username: {user.username}")
            print(f"  Role: {user.role}")
            print(f"  Active: {user.is_active}")
            print(f"  Created: {user.created_at}")
            print()
        
        admin_user = db.query(User).filter(User.email == 'admin@propescrow.com').first()
        if admin_user:
            print(f"✅ Found admin user with correct email: {admin_user.email}")
            return True
        
        admin_by_username = db.query(User).filter(User.username == 'admin').first()
        if admin_by_username:
            print(f"📝 Found admin user with username 'admin' but different email: {admin_by_username.email}")
            print("Updating email and password...")
            
            admin_by_username.email = 'admin@propescrow.com'
            admin_by_username.hashed_password = get_password_hash('siqfi2-kofgoz-Cikdab')
            admin_by_username.role = 'ADMIN'
            
            db.commit()
            db.refresh(admin_by_username)
            
            print(f"✅ Updated admin user: {admin_by_username.email}")
            return True
        
        print("❌ No admin user found")
        return False
        
    except Exception as e:
        print(f"❌ Database operation failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    list_and_update_users()
