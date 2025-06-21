interface CryptoPrice {
  ethereum: {
    zar: number;
  };
}

interface ConversionResult {
  ethAmount: number;
  zarAmount: number;
  formattedZar: string;
  formattedEth: string;
}

class CryptoConverterService {
  private baseUrl = 'https://api.coingecko.com/api/v3';
  private cache: { [key: string]: { price: number; timestamp: number } } = {};
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  async getEthToZarRate(): Promise<number> {
    const cacheKey = 'eth-zar';
    const now = Date.now();
    
    if (this.cache[cacheKey] && (now - this.cache[cacheKey].timestamp) < this.cacheTimeout) {
      return this.cache[cacheKey].price;
    }

    try {
      const response = await fetch(`${this.baseUrl}/simple/price?ids=ethereum&vs_currencies=zar`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: CryptoPrice = await response.json();
      const rate = data.ethereum.zar;
      
      this.cache[cacheKey] = {
        price: rate,
        timestamp: now
      };
      
      return rate;
    } catch (error) {
      console.error('Failed to fetch ETH to ZAR rate:', error);
      return 65000; // Fallback: ~65,000 ZAR per ETH
    }
  }

  async convertEthToZar(ethAmount: number | string): Promise<ConversionResult> {
    const eth = typeof ethAmount === 'string' ? parseFloat(ethAmount) : ethAmount;
    
    if (isNaN(eth)) {
      throw new Error('Invalid ETH amount');
    }

    const rate = await this.getEthToZarRate();
    const zarAmount = eth * rate;

    return {
      ethAmount: eth,
      zarAmount,
      formattedZar: new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: 'ZAR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(zarAmount),
      formattedEth: `${eth} ETH`
    };
  }

  formatCryptoWithZar(ethAmount: number | string): Promise<string> {
    return this.convertEthToZar(ethAmount).then(result => 
      `${result.formattedEth} (${result.formattedZar})`
    );
  }

  async getDisplayPrice(ethAmount: number | string): Promise<{ primary: string; secondary: string }> {
    const result = await this.convertEthToZar(ethAmount);
    return {
      primary: result.formattedZar,
      secondary: result.formattedEth
    };
  }
}

export const cryptoConverter = new CryptoConverterService();
export type { ConversionResult };
