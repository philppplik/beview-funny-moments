
// API configuration
export const API_CONFIG = {
  // BeReal API base URL
  baseUrl: "https://mobile.bereal.com/api",
  
  // CORS proxy for development
  corsProxy: "https://cors-anywhere.herokuapp.com/",
  
  // Timeout for API requests in milliseconds
  timeout: 10000,
  
  // Use mock data in development mode
  useMockInDev: true,
  
  // Additional headers for BeReal API
  headers: {
    "bereal-app-version": "0.30.0",
    "bereal-device-id": "ios",
    "bereal-device-language": "en-US",
    "user-agent": "BeReal/8309 CFNetwork/1399 Darwin/22.1.0"
  }
};
