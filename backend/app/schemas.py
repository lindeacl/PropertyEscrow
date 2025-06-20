from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from .models import UserRole

class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: str
    phone: Optional[str] = None
    role: UserRole
    wallet_address: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    wallet_address: Optional[str] = None
    is_active: Optional[bool] = None

class User(UserBase):
    id: int
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class UserProfileBase(BaseModel):
    bio: Optional[str] = None
    company: Optional[str] = None
    license_number: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    country: Optional[str] = "USA"
    profile_image_url: Optional[str] = None

class UserProfileCreate(UserProfileBase):
    pass

class UserProfileUpdate(UserProfileBase):
    pass

class UserProfile(UserProfileBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class PropertyCreate(BaseModel):
    property_address: str
    description: str
    price: int
    metadata_uri: Optional[str] = ""

class Property(BaseModel):
    id: int
    property_address: str
    description: str
    price: int
    seller: str
    is_active: bool
    metadata_uri: str

class EscrowCreate(BaseModel):
    property_id: int
    agent_address: str
    inspection_days: int
    closing_date: int
    terms: str
    earnest_money: float

class EscrowTransaction(BaseModel):
    id: int
    property_id: int
    buyer: str
    seller: str
    agent: str
    purchase_price: int
    earnest_money: int
    inspection_period_end: int
    closing_date: int
    status: int
    buyer_approval: bool
    seller_approval: bool
    agent_approval: bool
    admin_override: bool
    terms: str
    created_at: int

class TransactionRecordCreate(BaseModel):
    transaction_hash: str
    contract_transaction_id: Optional[int] = None
    property_id: Optional[int] = None
    transaction_type: str
    status: str
    amount: Optional[str] = None
    gas_used: Optional[str] = None
    gas_price: Optional[str] = None
    block_number: Optional[int] = None

class TransactionRecord(BaseModel):
    id: int
    user_id: int
    transaction_hash: str
    contract_transaction_id: Optional[int] = None
    property_id: Optional[int] = None
    transaction_type: str
    status: str
    amount: Optional[str] = None
    gas_used: Optional[str] = None
    gas_price: Optional[str] = None
    block_number: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class AdminOverrideRequest(BaseModel):
    transaction_id: int
    action: str
    complete: bool

class ApprovalRequest(BaseModel):
    transaction_id: int
    approval_type: str

class SystemSettingCreate(BaseModel):
    key: str
    value: str
    description: Optional[str] = None

class SystemSetting(BaseModel):
    id: int
    key: str
    value: str
    description: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
