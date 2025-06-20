from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from typing import List
import os
from dotenv import load_dotenv

from .database import engine, get_db
from .models import Base, User, UserProfile, TransactionRecord, SystemSettings, UserRole
from .schemas import (
    UserCreate, User as UserSchema, UserUpdate, UserProfileCreate, 
    UserProfile as UserProfileSchema, UserProfileUpdate, Token, LoginRequest,
    PropertyCreate, Property, EscrowCreate, EscrowTransaction,
    TransactionRecordCreate, TransactionRecord as TransactionRecordSchema,
    AdminOverrideRequest, ApprovalRequest, SystemSettingCreate, SystemSetting
)
from .auth import (
    get_password_hash, verify_password, create_access_token, get_current_user,
    get_current_active_user, require_role, require_admin
)
from .blockchain import blockchain_service

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Property Escrow System API",
    description="A blockchain-based property escrow system with role-based access control",
    version="1.0.0"
)

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

@app.post("/blockchain/properties", response_model=dict)
def create_property(
    property_data: PropertyCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
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

@app.get("/blockchain/properties/{property_id}", response_model=Property)
def get_property(property_id: int):
    try:
        property_data = blockchain_service.get_property(property_id)
        return Property(**property_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/blockchain/escrow", response_model=dict)
def create_escrow(
    escrow_data: EscrowCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    try:
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
            'gasPrice': blockchain_service.w3.to_wei('20', 'gwei'),
            'nonce': blockchain_service.w3.eth.get_transaction_count(blockchain_service.account.address),
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
