from app.database import SessionLocal
from app.models import User, UserRole
from app.auth import get_password_hash
import sys

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
        print('Admin user created successfully')
    else:
        print('Admin user already exists')
except Exception as e:
    print(f'Error creating admin user: {e}')
    sys.exit(1)
finally:
    db.close()
