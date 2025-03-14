
import { BeRealAuthResponse, OTPResponse } from "../types/beRealTypes";
import { PROXY_URL, BEREAL_API_BASE_URL, handleApiResponse } from "./apiUtils";

class BeRealAuthService {
  private token: string | null = null;
  private userId: string | null = null;

  constructor() {
    // Load stored token and userId if available
    this.token = localStorage.getItem("bereal_token");
    this.userId = localStorage.getItem("bereal_user_id");
  }

  getToken(): string | null {
    return this.token;
  }

  getUserId(): string | null {
    return this.userId;
  }

  // Mock authentication for development
  async mockAuthentication(phoneNumber: string): Promise<boolean> {
    console.log(`Mocking authentication for ${phoneNumber}`);
    
    // Store mock data
    const mockUserId = `user_${Date.now()}`;
    const mockToken = `mock_token_${Date.now()}`;
    const mockRefreshToken = `mock_refresh_${Date.now()}`;
    
    localStorage.setItem("bereal_token", mockToken);
    localStorage.setItem("bereal_user_id", mockUserId);
    localStorage.setItem("bereal_refresh_token", mockRefreshToken);
    
    this.token = mockToken;
    this.userId = mockUserId;
    
    return true;
  }

  // Send OTP to phone number
  async sendOTP(phoneNumber: string): Promise<OTPResponse> {
    try {
      // For development, use mock authentication
      if (process.env.NODE_ENV === 'development') {
        const success = await this.mockAuthentication(phoneNumber);
        return { success };
      }
      
      // Real API implementation
      const response = await fetch(`${PROXY_URL}${BEREAL_API_BASE_URL}/person/otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          phoneNumber
        }),
        mode: 'cors'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to send OTP" }));
        return { 
          success: false, 
          message: errorData.message || "Failed to send verification code" 
        };
      }

      return { success: true };
    } catch (error) {
      console.error("Failed to send OTP:", error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : "Failed to send verification code" 
      };
    }
  }

  // Verify OTP and login
  async verifyOTP(phoneNumber: string, code: string): Promise<OTPResponse> {
    try {
      // For development, use mock authentication
      if (process.env.NODE_ENV === 'development') {
        const success = await this.mockAuthentication(phoneNumber);
        return { success };
      }
      
      // Real API implementation
      const response = await fetch(`${PROXY_URL}${BEREAL_API_BASE_URL}/person/otp/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          phoneNumber,
          code
        }),
        mode: 'cors'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to verify OTP" }));
        return { 
          success: false, 
          message: errorData.message || "Failed to verify code" 
        };
      }

      const data: BeRealAuthResponse = await response.json();
      this.token = data.token;
      this.userId = data.userId;
      
      // Store auth data
      localStorage.setItem("bereal_token", data.token);
      localStorage.setItem("bereal_user_id", data.userId);
      localStorage.setItem("bereal_refresh_token", data.refreshToken);

      return { success: true };
    } catch (error) {
      console.error("Failed to verify OTP:", error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : "Failed to verify code" 
      };
    }
  }

  // Refresh token
  async refreshToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem("bereal_refresh_token");
    
    if (!refreshToken) {
      return false;
    }

    try {
      // For development, use mock refresh
      if (process.env.NODE_ENV === 'development') {
        console.log("Mock refreshing token");
        const mockToken = `mock_token_refreshed_${Date.now()}`;
        localStorage.setItem("bereal_token", mockToken);
        this.token = mockToken;
        return true;
      }
      
      // Real API implementation
      const response = await fetch(`${PROXY_URL}${BEREAL_API_BASE_URL}/person/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          refreshToken
        }),
        mode: 'cors'
      });

      if (!response.ok) {
        // Clear everything if refresh fails
        this.logout();
        return false;
      }

      const data: BeRealAuthResponse = await response.json();
      this.token = data.token;
      
      // Update token
      localStorage.setItem("bereal_token", data.token);
      localStorage.setItem("bereal_refresh_token", data.refreshToken);

      return true;
    } catch (error) {
      console.error("Failed to refresh token:", error);
      this.logout();
      return false;
    }
  }

  // Logout
  logout() {
    this.token = null;
    this.userId = null;
    localStorage.removeItem("bereal_token");
    localStorage.removeItem("bereal_user_id");
    localStorage.removeItem("bereal_refresh_token");
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.token;
  }
}

// Create and export singleton instance
export const beRealAuth = new BeRealAuthService();
