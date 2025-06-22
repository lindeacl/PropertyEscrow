from app.database import engine, Base
from app.models import *

try:
    Base.metadata.create_all(bind=engine)
    print('Database tables created successfully')
except Exception as e:
    print(f'Error creating database tables: {e}')
    exit(1)
