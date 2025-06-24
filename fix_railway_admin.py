#!/usr/bin/env python3
"""Fix admin user creation in Railway database"""

import os
import sys
import psycopg2
from passlib.context import CryptContext

DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    PGHOST = os.getenv('PGHOST')
    PGPORT = os.getenv('PGPORT', '5432')
    PGUSER = os.getenv('PGUSER', 'postgres')
    PGPASSWORD = os.getenv('PGPASSWORD')
    PGDATABASE = os.getenv('PGDATABASE', 'railway')
    
    if PGHOST and PGPASSWORD:
        DATABASE_URL = f"postgresql://{PGUSER}:{PGPASSWORD}@{PGHOST}:{PGPORT}/{PGDATABASE}"
    else:
        print("Error: No Railway database connection details found in environment variables")
        sys.exit(1)

ADMIN_EMAIL = "admin1@propescrow.com"
ADMIN_PASSWORD = "wdbqHF@xt!5zc%8$"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def fix_railway_admin():
    """Create or update admin user in Railway database"""
    try:
        print(f"Connecting to Railway database...")
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        
        cursor.execute("SELECT id, email, role, is_active FROM users WHERE email = %s", (ADMIN_EMAIL,))
        admin_user = cursor.fetchone()
        
        hashed_password = get_password_hash(ADMIN_PASSWORD)
        
        if admin_user:
            cursor.execute("""
                UPDATE users 
                SET hashed_password = %s, role = 'ADMIN', is_active = true, is_verified = true
                WHERE email = %s
            """, (hashed_password, ADMIN_EMAIL))
            print(f"Updated existing admin user: {ADMIN_EMAIL}")
        else:
            cursor.execute("""
                INSERT INTO users (email, username, hashed_password, full_name, role, is_active, is_verified)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (ADMIN_EMAIL, "admin1", hashed_password, "System Administrator", "ADMIN", True, True))
            print(f"Created new admin user: {ADMIN_EMAIL}")
        
        conn.commit()
        
        cursor.execute("SELECT email, role, is_active, is_verified FROM users WHERE email = %s", (ADMIN_EMAIL,))
        result = cursor.fetchone()
        print(f"Admin user verified: {result}")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"Error fixing Railway admin user: {e}")
        return False

if __name__ == "__main__":
    success = fix_railway_admin()
    sys.exit(0 if success else 1)
