// JSON-RPC response validation and error handling
export interface JsonRpcResponse {
  jsonrpc: string;
  id: number | string;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export class JsonRpcValidator {
  static validateResponse(responseText: string): JsonRpcResponse | null {
    // Check for empty or whitespace-only responses
    if (!responseText || typeof responseText !== 'string' || responseText.trim() === '') {
      console.error('Empty or invalid response received');
      return null;
    }

    // Check for common non-JSON responses
    if (responseText.startsWith('<html') || responseText.startsWith('<!DOCTYPE')) {
      console.error('Received HTML response instead of JSON');
      return null;
    }

    if (responseText.includes('404 Not Found') || responseText.includes('500 Internal Server Error')) {
      console.error('Received HTTP error response:', responseText.substring(0, 200));
      return null;
    }

    // Attempt to parse JSON
    let parsedResponse: any;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Response text (first 500 chars):', responseText.substring(0, 500));
      return null;
    }

    // Validate JSON-RPC structure
    if (!this.isValidJsonRpcResponse(parsedResponse)) {
      console.error('Invalid JSON-RPC response structure:', parsedResponse);
      return null;
    }

    return parsedResponse as JsonRpcResponse;
  }

  static isValidJsonRpcResponse(obj: any): boolean {
    if (!obj || typeof obj !== 'object') {
      return false;
    }

    // Check required fields
    if (obj.jsonrpc !== '2.0') {
      return false;
    }

    if (obj.id === undefined && obj.id !== null) {
      return false;
    }

    // Must have either result or error, but not both
    const hasResult = obj.result !== undefined;
    const hasError = obj.error !== undefined;

    if (!hasResult && !hasError) {
      return false;
    }

    if (hasResult && hasError) {
      return false;
    }

    // Validate error structure if present
    if (hasError) {
      const error = obj.error;
      if (!error || typeof error !== 'object') {
        return false;
      }
      if (typeof error.code !== 'number' || typeof error.message !== 'string') {
        return false;
      }
    }

    return true;
  }

  static async safeJsonRpcCall(
    url: string, 
    method: string, 
    params: any[] = [], 
    timeout: number = 5000
  ): Promise<JsonRpcResponse | null> {
    try {
      const response = await Promise.race([
        fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method,
            params,
            id: Date.now()
          })
        }),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error(`Request timeout after ${timeout}ms`)), timeout)
        )
      ]);

      if (!response.ok) {
        console.error(`HTTP ${response.status}: ${response.statusText}`);
        return null;
      }

      const responseText = await response.text();
      return this.validateResponse(responseText);
    } catch (error) {
      console.error('JSON-RPC call failed:', error);
      return null;
    }
  }

  static handleJsonRpcError(response: JsonRpcResponse): string {
    if (response.error) {
      const { code, message, data } = response.error;
      let errorMsg = `RPC Error ${code}: ${message}`;
      if (data) {
        errorMsg += ` (${JSON.stringify(data)})`;
      }
      return errorMsg;
    }
    return 'Unknown RPC error';
  }
}