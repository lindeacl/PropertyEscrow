#!/usr/bin/env python3

import sys
import os
import sqlite3

def check_database_validation_issues():
    """Check the database for validation issues that could cause API failures"""
    
    print("=== Checking Database Validation Issues ===")
    
    try:
        db_path = "backend/property_escrow.db"
        if not os.path.exists(db_path):
            print(f"❌ Database file not found: {db_path}")
            return False
        
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("\n=== Users Table Structure ===")
        cursor.execute("PRAGMA table_info(users)")
        columns = cursor.fetchall()
        for col in columns:
            print(f"{col[1]}: {col[2]} (nullable: {not col[3]})")
        
        print("\n=== Users Data with Potential Validation Issues ===")
        cursor.execute("SELECT id, email, username, role, is_active, is_verified FROM users")
        users = cursor.fetchall()
        
        validation_issues = []
        for user in users:
            print(f"ID: {user[0]}, Email: {user[1]}, Username: {user[2]}, Role: {user[3]}, is_active: {user[4]}, is_verified: {user[5]}")
            
            if user[4] is None:  # is_active
                validation_issues.append(f"User {user[0]} ({user[1]}) has NULL is_active")
            if user[5] is None:  # is_verified
                validation_issues.append(f"User {user[0]} ({user[1]}) has NULL is_verified")
            if user[3] not in ['ADMIN', 'AGENT', 'BUYER', 'SELLER']:
                validation_issues.append(f"User {user[0]} ({user[1]}) has invalid role: {user[3]}")
        
        print("\n=== Validation Issues Found ===")
        if validation_issues:
            for issue in validation_issues:
                print(f"❌ {issue}")
        else:
            print("✅ No validation issues found in users table")
        
        print("\n=== Transactions Table Check ===")
        cursor.execute("SELECT COUNT(*) FROM transactions")
        tx_count = cursor.fetchone()[0]
        print(f"Total transactions: {tx_count}")
        
        if tx_count > 0:
            cursor.execute("SELECT id, status, property_id FROM transactions LIMIT 5")
            transactions = cursor.fetchall()
            print("Sample transactions:")
            for tx in transactions:
                print(f"  ID: {tx[0]}, Status: {tx[1]}, Property ID: {tx[2]}")
        
        print("\n=== Properties Table Check ===")
        cursor.execute("SELECT COUNT(*) FROM properties")
        prop_count = cursor.fetchone()[0]
        print(f"Total properties: {prop_count}")
        
        if prop_count > 0:
            cursor.execute("SELECT id, title, price FROM properties LIMIT 5")
            properties = cursor.fetchall()
            print("Sample properties:")
            for prop in properties:
                print(f"  ID: {prop[0]}, Title: {prop[1]}, Price: {prop[2]}")
        
        conn.close()
        
        return len(validation_issues) == 0
        
    except Exception as e:
        print(f"❌ Database check failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    check_database_validation_issues()
