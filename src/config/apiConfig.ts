
// API configuration
export const API_CONFIG = {
  // BeReal API base URL (this is just for reference)
  baseUrl: "https://mobile.bereal.com/api",
  
  // Our Supabase Edge Function CORS proxy
  corsProxy: "https://ekdizcuhtpxlxyodpdmb.supabase.co/functions/v1/bereal-proxy/",
  
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
