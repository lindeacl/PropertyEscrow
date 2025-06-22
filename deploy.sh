#!/bin/bash

set -e

echo "🚀 Starting Property Escrow Enterprise Deployment..."

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available. Please install Docker Compose first."
    exit 1
fi

echo "📋 Setting up SSL certificates..."
mkdir -p ssl
if [ ! -f ssl/cert.pem ]; then
    openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes \
        -subj "/C=ZA/ST=Gauteng/L=Johannesburg/O=PropertyEscrow/CN=localhost"
    echo "✅ Self-signed SSL certificates created"
fi

if [ ! -f .env.production ]; then
    echo "📝 Creating production environment file..."
    cat > .env.production << EOF
POSTGRES_DB=property_escrow
POSTGRES_USER=postgres
POSTGRES_PASSWORD=$(openssl rand -base64 32)

JWT_SECRET_KEY=$(openssl rand -hex 32)

ALCHEMY_API_KEY=b1XG3sSpmuOpC3SaLNmHJCioS__mzr_n
PRIVATE_KEY=b8dd42c965bbc72e3f596912a53a2e80b5cea29f8d1d3648b262e4f14e4c716f
FACTORY_CONTRACT_ADDRESS=0x742d35Cc6634C0532925a3b8D4C9db96c4b4d8b6

ENVIRONMENT=production
API_URL=https://localhost/api
EOF
    echo "✅ Production environment file created"
    echo "⚠️  Please review and update .env.production with your specific values"
fi

echo "🔨 Building and starting services..."
docker compose --env-file .env.production up --build -d

echo "⏳ Waiting for services to be ready..."
sleep 30

echo "🔍 Checking service health..."
if docker compose ps | grep -q "Up (healthy)"; then
    echo "✅ Services are running and healthy"
else
    echo "❌ Some services are not healthy. Checking logs..."
    docker compose logs
    exit 1
fi

echo "📊 Running database migrations..."
docker compose exec backend python -c "
from app.database import engine, Base
from app.models import *
Base.metadata.create_all(bind=engine)
print('Database tables created successfully')
"

echo "👤 Creating admin user..."
docker compose exec backend python -c "
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
"

echo "🎉 Property Escrow deployment completed successfully!"
echo ""
echo "📋 Access Information:"
echo "   Frontend: https://localhost"
echo "   Backend API: https://localhost/api"
echo "   Admin Panel: https://localhost/admin"
echo ""
echo "🔐 Admin Credentials:"
echo "   Email: admin1@propescrow.com"
echo "   Password: wdbqHF@xt!5zc%8$"
echo ""
echo "📊 Management Commands:"
echo "   View logs: docker compose logs -f"
echo "   Stop services: docker compose down"
echo "   Restart services: docker compose restart"
echo "   Update services: docker compose pull && docker compose up -d"
echo ""
echo "⚠️  Security Notes:"
echo "   - Update default passwords in .env.production"
echo "   - Replace self-signed SSL certificates with proper ones"
echo "   - Configure firewall rules for production"
echo "   - Set up regular database backups"
