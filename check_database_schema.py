#!/usr/bin/env python3

import sys
import os
import sqlite3

def check_database_schema():
    """Check what tables actually exist in the database"""
    
    print("=== Checking Database Schema ===")
    
    try:
        db_path = "backend/property_escrow.db"
        if not os.path.exists(db_path):
            print(f"❌ Database file not found: {db_path}")
            return False
        
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("\n=== All Tables in Database ===")
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        
        if not tables:
            print("❌ No tables found in database!")
            return False
        
        for table in tables:
            table_name = table[0]
            print(f"\n📋 Table: {table_name}")
            
            cursor.execute(f"PRAGMA table_info({table_name})")
            columns = cursor.fetchall()
            for col in columns:
                print(f"  - {col[1]}: {col[2]} (nullable: {not col[3]})")
            
            cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
            count = cursor.fetchone()[0]
            print(f"  📊 Rows: {count}")
            
            if count > 0 and count <= 10:
                cursor.execute(f"SELECT * FROM {table_name} LIMIT 3")
                rows = cursor.fetchall()
                print(f"  📄 Sample data:")
                for i, row in enumerate(rows):
                    print(f"    Row {i+1}: {row}")
        
        print("\n=== Expected vs Actual Tables ===")
        expected_tables = ['users', 'properties', 'transactions', 'escrows']
        actual_tables = [table[0] for table in tables]
        
        for expected in expected_tables:
            if expected in actual_tables:
                print(f"✅ {expected} - EXISTS")
            else:
                print(f"❌ {expected} - MISSING")
        
        for actual in actual_tables:
            if actual not in expected_tables:
                print(f"🔍 {actual} - UNEXPECTED TABLE")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Database schema check failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    check_database_schema()
