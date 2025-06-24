import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import User, UserRole
from app.auth import get_password_hash

RAILWAY_DATABASE_URL = f"postgresql://postgres:{os.getenv('railway')}@junction.proxy.rlwy.net:26738/railway"

engine = create_engine(RAILWAY_DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

db = SessionLocal()
try:
    admin = db.query(User).filter(User.email == 'admin1@propescrow.com').first()
    if not admin:
        admin = User(
            email='admin1@propescrow.com',
            username='admin1',
            hashed_password=get_password_hash('wdbqHF@xt!5zc%8$'),
            full_name='System Administrator',
            role=UserRole.ADMIN,
            is_active=True,
            is_verified=True
        )
        db.add(admin)
        db.commit()
        print('Admin user created successfully in Railway database')
    else:
        print('Admin user already exists in Railway database')
except Exception as e:
    print(f'Error creating admin user in Railway database: {e}')
    sys.exit(1)
finally:
    db.close()
