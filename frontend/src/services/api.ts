import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';

interface LoginResponse {
  access_token: string;
  token_type: string;
}

interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  phone?: string;
  role: 'admin' | 'agent' | 'buyer' | 'seller';
  wallet_address?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

interface RegisterData {
  email: string;
  username: string;
  password: string;
  full_name: string;
  phone?: string;
  role: 'admin' | 'agent' | 'buyer' | 'seller';
  wallet_address?: string;
}

interface PropertyData {
  property_address: string;
  description: string;
  price: number;
  metadata_uri?: string;
}

interface EscrowData {
  property_id: number;
  agent_address: string;
  inspection_days: number;
  closing_date: number;
  terms: string;
  earnest_money: number;
}

interface TransactionRecord {
  id: number;
  user_id: number;
  transaction_hash: string;
  contract_transaction_id?: number;
  property_id?: number;
  transaction_type: string;
  status: string;
  amount?: string;
  gas_used?: string;
  gas_price?: string;
  block_number?: number;
  created_at: string;
  updated_at?: string;
}

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  setAuthToken(token: string | null) {
    if (token) {
      this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.api.defaults.headers.common['Authorization'];
    }
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await this.api.post('/auth/login', { email, password });
    return response.data;
  }

  async register(userData: RegisterData): Promise<User> {
    const response = await this.api.post('/auth/register', userData);
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.api.get('/auth/me');
    return response.data;
  }

  async updateCurrentUser(userData: Partial<User>): Promise<User> {
    const response = await this.api.put('/auth/me', userData);
    return response.data;
  }

  async getUsers(skip: number = 0, limit: number = 100): Promise<User[]> {
    const response = await this.api.get(`/users?skip=${skip}&limit=${limit}`);
    return response.data;
  }

  async getUser(userId: number): Promise<User> {
    const response = await this.api.get(`/users/${userId}`);
    return response.data;
  }

  async createProperty(propertyData: PropertyData): Promise<{ transaction_hash: string; status: string }> {
    const response = await this.api.post('/blockchain/properties', propertyData);
    return response.data;
  }

  async getProperty(propertyId: number): Promise<any> {
    const response = await this.api.get(`/blockchain/properties/${propertyId}`);
    return response.data;
  }

  async createEscrow(escrowData: EscrowData): Promise<{ transaction_hash: string; status: string }> {
    const response = await this.api.post('/blockchain/escrow', escrowData);
    return response.data;
  }

  async getEscrowTransaction(transactionId: number): Promise<any> {
    const response = await this.api.get(`/blockchain/escrow/${transactionId}`);
    return response.data;
  }

  async giveApproval(transactionId: number, approvalType: string): Promise<{ transaction_hash: string; status: string }> {
    const response = await this.api.post('/blockchain/approval', {
      transaction_id: transactionId,
      approval_type: approvalType,
    });
    return response.data;
  }

  async adminOverride(transactionId: number, action: string, complete: boolean): Promise<{ transaction_hash: string; status: string }> {
    const response = await this.api.post('/admin/override', {
      transaction_id: transactionId,
      action,
      complete,
    });
    return response.data;
  }

  async getUserTransactions(): Promise<TransactionRecord[]> {
    const response = await this.api.get('/transactions');
    return response.data;
  }

  async getAllTransactions(skip: number = 0, limit: number = 100): Promise<TransactionRecord[]> {
    const response = await this.api.get(`/admin/transactions?skip=${skip}&limit=${limit}`);
    return response.data;
  }

  async updateUserRole(userId: number, role: string): Promise<{ user_id: number; role: string; updated: boolean }> {
    const response = await this.api.put(`/admin/users/${userId}/role`, role);
    return response.data;
  }

  async getSystemStatus(): Promise<{ message: string; version: string; blockchain_connected: boolean }> {
    const response = await this.api.get('/');
    return response.data;
  }
}

export const apiService = new ApiService();
