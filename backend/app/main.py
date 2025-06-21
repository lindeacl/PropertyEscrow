from fastapi import FastAPI, Depends, HTTPException, status, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from typing import List
import os
import json
import time
from dotenv import load_dotenv

from .database import engine, get_db
from .models import Base, User, UserProfile, Property, TransactionRecord, SystemSettings, UserRole
from .schemas import (
    UserCreate, User as UserSchema, UserUpdate, UserProfileCreate, 
    UserProfile as UserProfileSchema, UserProfileUpdate, Token, LoginRequest,
    PropertyCreate, PropertyUpdate, Property, EscrowCreate, EscrowTransaction,
    TransactionRecordCreate, TransactionRecord as TransactionRecordSchema,
    AdminOverrideRequest, ApprovalRequest, SystemSettingCreate, SystemSetting
)
from .auth import (
    get_password_hash, verify_password, create_access_token, get_current_user,
    get_current_active_user, require_role, require_admin
)
from .blockchain import blockchain_service
from .alchemy_deployer import alchemy_deployer

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Property Escrow System API",
    description="A blockchain-based property escrow system with role-based access control",
    version="1.0.0"
)

IS_DEPLOYED = os.getenv("FLY_APP_NAME") is not None or os.getenv("RAILWAY_ENVIRONMENT") is not None
ENVIRONMENT = "DEPLOYED" if IS_DEPLOYED else "LOCAL"

print(f"DEBUG: FastAPI starting in {ENVIRONMENT} environment")

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    
    client_host = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "unknown")
    content_type = request.headers.get("content-type", "unknown")
    
    if IS_DEPLOYED and request.url.path.startswith("/blockchain"):
        print(f"DEPLOYED-DEBUG: Blockchain request {request.method} {request.url.path}")
        print(f"DEPLOYED-DEBUG: Client: {client_host}, User-Agent: {user_agent}")
        print(f"DEPLOYED-DEBUG: Content-Type: {content_type}")
        print(f"DEPLOYED-DEBUG: Headers: {dict(request.headers)}")
    
    body = None
    if request.method == "POST":
        body = await request.body()
        async def receive():
            return {"type": "http.request", "body": body}
        request._receive = receive
    
    if IS_DEPLOYED and body and request.url.path.startswith("/blockchain"):
        try:
            body_str = body.decode('utf-8')
            print(f"DEPLOYED-DEBUG: Request body: {body_str}")
            if content_type == "application/json":
                body_json = json.loads(body_str)
                print(f"DEPLOYED-DEBUG: Request data types: {[(k, type(v)) for k, v in body_json.items()]}")
                print(f"DEPLOYED-DEBUG: Request data values: {body_json}")
        except Exception as e:
            print(f"DEPLOYED-DEBUG: Could not parse request body: {e}")
    elif not IS_DEPLOYED:
        print(f"DEBUG: Request {request.method} {request.url.path}")
        print(f"DEBUG: Client: {client_host}, User-Agent: {user_agent}")
        print(f"DEBUG: Content-Type: {content_type}")
        if body:
            try:
                body_str = body.decode('utf-8')
                print(f"DEBUG: Request body: {body_str}")
                if content_type == "application/json":
                    body_json = json.loads(body_str)
                    print(f"DEBUG: Request data types: {[(k, type(v)) for k, v in body_json.items()]}")
            except Exception as e:
                print(f"DEBUG: Could not parse request body: {e}")
    
    response = await call_next(request)
    
    process_time = time.time() - start_time
    
    if IS_DEPLOYED and request.url.path.startswith("/blockchain"):
        print(f"DEPLOYED-DEBUG: Request completed in {process_time:.3f}s with status {response.status_code}")
    elif not IS_DEPLOYED:
        print(f"DEBUG: Request completed in {process_time:.3f}s with status {response.status_code}")
    
    return response

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

security = HTTPBearer()

@app.get("/")
def read_root():
    return {
        "message": "Property Escrow System API",
        "version": "1.0.0",
        "blockchain_connected": blockchain_service.is_connected()
    }

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.post("/auth/register", response_model=UserSchema)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Username already taken"
        )
    
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password,
        full_name=user.full_name,
        phone=user.phone,
        role=user.role,
        wallet_address=user.wallet_address if user.wallet_address else None
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/auth/login", response_model=Token)
def login_user(login_data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/me", response_model=UserSchema)
def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    return current_user

@app.put("/auth/me", response_model=UserSchema)
def update_current_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    for field, value in user_update.dict(exclude_unset=True).items():
        setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    return current_user

@app.get("/users", response_model=List[UserSchema])
def get_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@app.get("/users/{user_id}", response_model=UserSchema)
def get_user(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.ADMIN and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.post("/users/{user_id}/profile", response_model=UserProfileSchema)
def create_user_profile(
    user_id: int,
    profile: UserProfileCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.ADMIN and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    existing_profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if existing_profile:
        raise HTTPException(status_code=400, detail="Profile already exists")
    
    db_profile = UserProfile(user_id=user_id, **profile.dict())
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile

@app.get("/users/{user_id}/profile", response_model=UserProfileSchema)
def get_user_profile(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.ADMIN and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@app.put("/users/{user_id}/profile", response_model=UserProfileSchema)
def update_user_profile(
    user_id: int,
    profile_update: UserProfileUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.ADMIN and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    for field, value in profile_update.dict(exclude_unset=True).items():
        setattr(profile, field, value)
    
    db.commit()
    db.refresh(profile)
    return profile

@app.post("/properties", response_model=Property)
async def create_property(
    property_data: PropertyCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new property listing with smart contract deployment"""
    try:
        db_property = Property(
            user_id=current_user.id,
            property_address=property_data.property_address,
            description=property_data.description,
            price=property_data.price,
            metadata_uri=property_data.metadata_uri,
            deployment_status="deploying"
        )
        db.add(db_property)
        db.commit()
        db.refresh(db_property)
        
        if alchemy_deployer.is_connected():
            deployment_result = await alchemy_deployer.deploy_property_contract({
                "property_address": property_data.property_address,
                "description": property_data.description,
                "price": property_data.price,
                "metadata_uri": property_data.metadata_uri or ""
            })
            
            if deployment_result["success"]:
                db_property.contract_address = deployment_result["contract_address"]
                db_property.deployment_tx_hash = deployment_result["transaction_hash"]
                db_property.deployment_status = "deployed"
                
                transaction_record = TransactionRecord(
                    user_id=current_user.id,
                    property_id=db_property.id,
                    transaction_hash=deployment_result["transaction_hash"],
                    contract_address=deployment_result["contract_address"],
                    transaction_type="PROPERTY_DEPLOYMENT",
                    status="completed",
                    gas_used=str(deployment_result.get("gas_used", 0)),
                    block_number=deployment_result.get("block_number", 0)
                )
                db.add(transaction_record)
            else:
                db_property.deployment_status = "failed"
                
                transaction_record = TransactionRecord(
                    user_id=current_user.id,
                    property_id=db_property.id,
                    transaction_hash=deployment_result.get("transaction_hash", ""),
                    transaction_type="PROPERTY_DEPLOYMENT",
                    status="failed"
                )
                db.add(transaction_record)
        else:
            db_property.deployment_status = "legacy"
            db_property.contract_address = os.getenv("CONTRACT_ADDRESS")
        
        db.commit()
        db.refresh(db_property)
        
        return db_property
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create property: {str(e)}")

@app.post("/blockchain/properties", response_model=dict)
def create_property_legacy(
    property_data: PropertyCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Legacy endpoint for backward compatibility"""
    try:
        tx_hash = blockchain_service.list_property(
            property_data.property_address,
            property_data.description,
            property_data.price,
            property_data.metadata_uri
        )
        
        transaction_record = TransactionRecord(
            user_id=current_user.id,
            transaction_hash=tx_hash,
            transaction_type="LIST_PROPERTY",
            status="PENDING",
            amount=str(property_data.price)
        )
        db.add(transaction_record)
        db.commit()
        
        return {"transaction_hash": tx_hash, "status": "pending"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/properties", response_model=List[Property])
async def get_properties(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all active properties"""
    properties = db.query(Property).filter(
        Property.is_active == True
    ).offset(skip).limit(limit).all()
    
    return properties

@app.get("/properties/my", response_model=List[Property])
async def get_my_properties(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get properties owned by the current user"""
    properties = db.query(Property).filter(
        Property.user_id == current_user.id
    ).order_by(Property.created_at.desc()).all()
    
    return properties

@app.get("/properties/{property_id}", response_model=Property)
async def get_property(
    property_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific property by ID"""
    property_obj = db.query(Property).filter(Property.id == property_id).first()
    if not property_obj:
        raise HTTPException(status_code=404, detail="Property not found")
    
    return property_obj

@app.put("/properties/{property_id}", response_model=Property)
async def update_property(
    property_id: int,
    property_update: PropertyUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update a property (only by owner or admin)"""
    property_obj = db.query(Property).filter(Property.id == property_id).first()
    if not property_obj:
        raise HTTPException(status_code=404, detail="Property not found")
    
    if property_obj.user_id != current_user.id and current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update this property")
    
    for field, value in property_update.dict(exclude_unset=True).items():
        setattr(property_obj, field, value)
    
    db.commit()
    db.refresh(property_obj)
    
    return property_obj

@app.get("/blockchain/properties/{property_id}", response_model=Property)
def get_property_legacy(property_id: int):
    """Legacy endpoint for backward compatibility"""
    try:
        property_data = blockchain_service.get_property(property_id)
        return Property(**property_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/blockchain/escrow", response_model=dict)
def create_escrow(
    escrow_data: EscrowCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    request: Request = None
):
    try:
        print(f"DEBUG: Escrow creation request from {request.client.host if request and hasattr(request, 'client') else 'unknown'}")
        print(f"DEBUG: Request data: {escrow_data.dict()}")
        
        tx_hash = blockchain_service.create_escrow(
            escrow_data.property_id,
            escrow_data.agent_address,
            escrow_data.inspection_days,
            escrow_data.closing_date,
            escrow_data.terms,
            escrow_data.earnest_money
        )
        
        transaction_record = TransactionRecord(
            user_id=current_user.id,
            transaction_hash=tx_hash,
            property_id=escrow_data.property_id,
            transaction_type="CREATE_ESCROW",
            status="PENDING",
            amount=str(escrow_data.earnest_money)
        )
        db.add(transaction_record)
        db.commit()
        
        return {"transaction_hash": tx_hash, "status": "pending"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/blockchain/escrow/{transaction_id}", response_model=EscrowTransaction)
def get_escrow_transaction(transaction_id: int):
    try:
        transaction_data = blockchain_service.get_escrow_transaction(transaction_id)
        return EscrowTransaction(**transaction_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/blockchain/approval", response_model=dict)
def give_approval(
    approval_data: ApprovalRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    try:
        tx_hash = blockchain_service.give_approval(
            approval_data.transaction_id,
            approval_data.approval_type
        )
        
        transaction_record = TransactionRecord(
            user_id=current_user.id,
            transaction_hash=tx_hash,
            contract_transaction_id=approval_data.transaction_id,
            transaction_type=f"APPROVAL_{approval_data.approval_type.upper()}",
            status="PENDING"
        )
        db.add(transaction_record)
        db.commit()
        
        return {"transaction_hash": tx_hash, "status": "pending"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/admin/override", response_model=dict)
def admin_override(
    override_data: AdminOverrideRequest,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    try:
        if not blockchain_service.contract or not blockchain_service.account:
            raise HTTPException(status_code=500, detail="Contract or account not loaded")
        
        function_call = blockchain_service.contract.functions.adminOverride(
            override_data.transaction_id,
            override_data.action,
            override_data.complete
        )
        
        transaction = function_call.build_transaction({
            'from': blockchain_service.account.address,
            'gas': 500000,
            'gasPrice': blockchain_service.w3.to_wei('25', 'gwei'),
        })
        
        tx_hash = blockchain_service.send_transaction(transaction)
        
        transaction_record = TransactionRecord(
            user_id=current_user.id,
            transaction_hash=tx_hash,
            contract_transaction_id=override_data.transaction_id,
            transaction_type="ADMIN_OVERRIDE",
            status="PENDING"
        )
        db.add(transaction_record)
        db.commit()
        
        return {"transaction_hash": tx_hash, "status": "pending"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/admin/users/{user_id}/role", response_model=dict)
def get_user_role(
    user_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"user_id": user_id, "role": user.role.value}

@app.put("/admin/users/{user_id}/role", response_model=dict)
def update_user_role(
    user_id: int,
    role: UserRole,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.role = role
    db.commit()
    return {"user_id": user_id, "role": role.value, "updated": True}

@app.get("/transactions", response_model=List[TransactionRecordSchema])
def get_user_transactions(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    transactions = db.query(TransactionRecord).filter(
        TransactionRecord.user_id == current_user.id
    ).order_by(TransactionRecord.created_at.desc()).all()
    return transactions

@app.get("/admin/transactions", response_model=List[TransactionRecordSchema])
def get_all_transactions(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    transactions = db.query(TransactionRecord).order_by(
        TransactionRecord.created_at.desc()
    ).offset(skip).limit(limit).all()
    return transactions

@app.get("/admin/settings", response_model=List[SystemSetting])
def get_system_settings(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    settings = db.query(SystemSettings).all()
    return settings

@app.post("/admin/settings", response_model=SystemSetting)
def create_system_setting(
    setting: SystemSettingCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    db_setting = SystemSettings(**setting.dict())
    db.add(db_setting)
    db.commit()
    db.refresh(db_setting)
    return db_setting
