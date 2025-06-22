# Property Escrow System

A modern blockchain-based property escrow system built on Polygon with smart contracts, role-based access control, and administrator management.

## Deploy to Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/fastapi?referralCode=devin)

Click the button above to deploy the backend to Railway. After deployment, update the frontend environment variable `VITE_API_URL` to point to your Railway backend URL.

## Architecture

### Smart Contracts (Polygon)
- Property escrow contract with multi-party approval
- Role-based access control
- Administrator oversight capabilities
- Integration with Alchemy for blockchain operations

### Backend (FastAPI + MySQL)
- User account and profile management
- Authentication and authorization
- Role-based access control (Buyer, Seller, Agent, Administrator)
- API endpoints for frontend integration

### Frontend (React + TypeScript)
- Modern UI for all escrow parties
- Administrator control panel
- Role-based dashboards
- Real-time transaction status

## Tech Stack

- **Blockchain**: Polygon, Solidity, Alchemy
- **Backend**: FastAPI, MySQL, SQLAlchemy
- **Frontend**: React, TypeScript, Tailwind CSS
- **Development**: Hardhat for smart contract development

## Roles

1. **Administrator**: Full system control, can override transactions
2. **Agent**: Manages escrow process, facilitates transactions
3. **Buyer**: Initiates purchases, deposits funds
4. **Seller**: Lists properties, receives payments
