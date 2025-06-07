// Simple API bridge for blockchain connectivity
window.blockchainAPI = {
  async getStatus() {
    try {
      const response = await fetch('http://127.0.0.1:8546/api/status', {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API bridge error:', error);
      return {
        error: 'Connection failed',
        blockchain: { success: false, error: error.message },
        contracts: {}
      };
    }
  }
};