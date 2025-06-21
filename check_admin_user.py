#!/usr/bin/env python3

import sys
import os
sys.path.append('backend')

from backend.app.database import get_db
from backend.app.models import User
from sqlalchemy.orm import Session

def check_admin_user():
    """Check if admin user exists in database"""
    
    print("=== Checking Admin User in Database ===")
    
    try:
        db = next(get_db())
        
        admin_user = db.query(User).filter(User.email == 'admin@test.com').first()
        if admin_user:
            print(f"✅ Admin user exists: {admin_user.email}")
            print(f"Role: {admin_user.role}")
            print(f"Password hash: {admin_user.hashed_password[:50]}...")
            print(f"Created at: {admin_user.created_at}")
        else:
            print("❌ Admin user not found in database")
            
        all_users = db.query(User).all()
        print(f"\nTotal users in database: {len(all_users)}")
        for user in all_users:
            print(f"- {user.email} ({user.role}) - Created: {user.created_at}")
            
        return admin_user is not None
        
    except Exception as e:
        print(f"❌ Database check failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    check_admin_user()
