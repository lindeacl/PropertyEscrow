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
