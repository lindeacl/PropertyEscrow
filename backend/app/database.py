from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./property_escrow.db")

if DATABASE_URL.startswith("mysql"):
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
elif DATABASE_URL.startswith("postgresql"):
    if "psycopg2" in DATABASE_URL:
        DATABASE_URL = DATABASE_URL.replace("psycopg2", "psycopg")
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
else:
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
