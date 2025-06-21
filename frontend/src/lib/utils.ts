import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatZAR(amount: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCrypto(amount: number | string, symbol: string = 'ETH'): string {
  return `${amount} ${symbol}`;
}

export async function formatCryptoWithZar(ethAmount: number | string): Promise<string> {
  try {
    const { cryptoConverter } = await import('../services/cryptoConverter');
    return await cryptoConverter.formatCryptoWithZar(ethAmount);
  } catch (error) {
    console.error('Failed to convert crypto to ZAR:', error);
    return `${ethAmount} ETH`;
  }
}

export const isValidEthereumAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export const validateEscrowData = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!data.property_id || isNaN(parseInt(data.property_id))) {
    errors.push("Property ID must be a valid number");
  }
  
  if (!data.agent_address) {
    errors.push("Agent wallet address is required");
  } else if (!isValidEthereumAddress(data.agent_address)) {
    errors.push("Agent wallet address must be a valid Ethereum address (0x followed by 40 characters)");
  }
  
  if (!data.inspection_days || isNaN(parseInt(data.inspection_days)) || parseInt(data.inspection_days) < 1) {
    errors.push("Inspection days must be a positive number");
  }
  
  if (!data.closing_date) {
    errors.push("Closing date is required");
  } else if (new Date(data.closing_date) <= new Date()) {
    errors.push("Closing date must be in the future");
  }
  
  if (!data.earnest_money || isNaN(parseFloat(data.earnest_money)) || parseFloat(data.earnest_money) <= 0) {
    errors.push("Earnest money must be a positive amount");
  }
  
  if (!data.terms || data.terms.trim().length < 10) {
    errors.push("Terms and conditions must be at least 10 characters long");
  }
  
  return { isValid: errors.length === 0, errors };
};
