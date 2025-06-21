#!/usr/bin/env python3

import sys
import os
sys.path.append('backend')

from backend.app.database import engine, get_db
from backend.app.models import Base, User
from backend.app.auth import get_password_hash
from sqlalchemy.orm import Session

def init_database():
    """Initialize database tables and create admin user"""
    
    print("=== Initializing Database ===")
    
    try:
        print("Creating database tables...")
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully")
        
        db = next(get_db())
        
        existing_admin = db.query(User).filter(User.email == 'admin@propescrow.com').first()
        if existing_admin:
            print("✅ Admin user already exists")
            return True
            
        print("Creating admin user...")
        admin_user = User(
            email='admin@propescrow.com',
            username='admin',
            hashed_password=get_password_hash('siqfi2-kofgoz-Cikdab'),
            full_name='System Administrator',
            role='ADMIN',
            is_active=True,
            is_verified=True
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print(f"✅ Admin user created: {admin_user.email} (ID: {admin_user.id})")
        return True
        
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    init_database()
