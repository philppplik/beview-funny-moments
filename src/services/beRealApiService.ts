import { useToast } from "@/components/ui/use-toast";

// Define types for BeReal API responses
export interface BeRealUser {
  id: string;
  username: string;
  profilePicture?: string;
}

export interface BeRealPost {
  id: string;
  user: BeRealUser;
  primary: string; // URL for main photo
  secondary: string; // URL for selfie photo
  caption?: string;
  location?: string;
  takenAt: string;
  realmojis: any[];
  comments: number;
}

export interface BeRealAuthResponse {
  token: string;
  refreshToken: string;
  userId: string;
}

class BeRealApiService {
  private baseURL = "https://mobile.bereal.com/api";
  private token: string | null = null;
  private userId: string | null = null;
  private proxyUrl = "https://cors-anywhere.herokuapp.com/"; // CORS proxy URL

  constructor() {
    // Load stored token and userId if available
    this.token = localStorage.getItem("bereal_token");
    this.userId = localStorage.getItem("bereal_user_id");
  }

  // Helper for making authenticated requests
  private async request(endpoint: string, options: RequestInit = {}) {
    if (!this.token) {
      throw new Error("Not authenticated");
    }

    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${this.token}`,
      ...options.headers
    };

    try {
      const response = await fetch(`${this.proxyUrl}${this.baseURL}${endpoint}`, {
        ...options,
        headers,
        mode: 'cors'
      });

      if (response.status === 401) {
        // Token expired, try to refresh
        await this.refreshToken();
        // Retry the request
        return this.request(endpoint, options);
      }

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message || `API error: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // For demo purposes: Mock authentication to avoid real API calls
  // We'll use local storage to simulate authentication
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

  // Authenticate with OTP
  async sendOTP(phoneNumber: string): Promise<boolean> {
    try {
      // For development purposes, use the mock authentication
      // In production, you would uncomment the real API call below
      return await this.mockAuthentication(phoneNumber);
      
      /* Real implementation (currently disabled due to CORS):
      const response = await fetch(`${this.proxyUrl}${this.baseURL}/person/otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          phoneNumber
        }),
        mode: 'cors'
      });

      return response.ok;
      */
    } catch (error) {
      console.error("Failed to send OTP:", error);
      return false;
    }
  }

  // Verify OTP and login
  async verifyOTP(phoneNumber: string, code: string): Promise<boolean> {
    try {
      // For development purposes, use the mock authentication
      // In production, you would uncomment the real API call below
      return await this.mockAuthentication(phoneNumber);
      
      /* Real implementation (currently disabled due to CORS):
      const response = await fetch(`${this.proxyUrl}${this.baseURL}/person/otp/verify`, {
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
        return false;
      }

      const data: BeRealAuthResponse = await response.json();
      this.token = data.token;
      this.userId = data.userId;
      
      // Store auth data
      localStorage.setItem("bereal_token", data.token);
      localStorage.setItem("bereal_user_id", data.userId);
      localStorage.setItem("bereal_refresh_token", data.refreshToken);

      return true;
      */
    } catch (error) {
      console.error("Failed to verify OTP:", error);
      return false;
    }
  }

  // Refresh token
  private async refreshToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem("bereal_refresh_token");
    
    if (!refreshToken) {
      return false;
    }

    try {
      // For development purposes, use this mock refresh
      console.log("Mock refreshing token");
      const mockToken = `mock_token_refreshed_${Date.now()}`;
      localStorage.setItem("bereal_token", mockToken);
      this.token = mockToken;
      return true;
      
      /* Real implementation (currently disabled due to CORS):
      const response = await fetch(`${this.proxyUrl}${this.baseURL}/person/refresh-token`, {
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
      */
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

  // Get friends feed - mock implementation for development
  async getFriendsFeed(page = 0): Promise<BeRealPost[]> {
    try {
      // Mock data for development
      return this.generateMockPosts(8);
      
      /* Real implementation (currently disabled due to CORS):
      const data = await this.request(`/content/friends?page=${page}`);
      return data.posts.map((post: any) => ({
        id: post.id,
        user: {
          id: post.user.id,
          username: post.user.username,
          profilePicture: post.user.profilePicture?.url
        },
        primary: post.photoURL,
        secondary: post.secondaryPhotoURL,
        caption: post.caption,
        location: post.location?.name,
        takenAt: post.takenAt,
        realmojis: post.realmojis || [],
        comments: post.comment?.count || 0
      }));
      */
    } catch (error) {
      console.error("Failed to get friends feed:", error);
      return [];
    }
  }

  // Get discovery feed (public posts) - mock implementation for development
  async getDiscoveryFeed(page = 0): Promise<BeRealPost[]> {
    try {
      // Mock data for development
      return this.generateMockPosts(12);
      
      /* Real implementation (currently disabled due to CORS):
      const data = await this.request(`/content/discovery?page=${page}`);
      return data.posts.map((post: any) => ({
        id: post.id,
        user: {
          id: post.user.id,
          username: post.user.username,
          profilePicture: post.user.profilePicture?.url
        },
        primary: post.photoURL,
        secondary: post.secondaryPhotoURL,
        caption: post.caption,
        location: post.location?.name,
        takenAt: post.takenAt,
        realmojis: post.realmojis || [],
        comments: post.comment?.count || 0
      }));
      */
    } catch (error) {
      console.error("Failed to get discovery feed:", error);
      return [];
    }
  }

  // Helper function to generate mock posts for development
  private generateMockPosts(count: number): BeRealPost[] {
    const posts: BeRealPost[] = [];
    
    for (let i = 0; i < count; i++) {
      const userId = `user_${i}`;
      const username = `user${i}`;
      
      posts.push({
        id: `post_${i}_${Date.now()}`,
        user: {
          id: userId,
          username: username,
          profilePicture: `https://i.pravatar.cc/150?u=${userId}`
        },
        primary: `https://picsum.photos/800/1000?random=${i}`,
        secondary: `https://picsum.photos/300/400?random=${i+100}`,
        caption: i % 3 === 0 ? `This is a mock BeReal post #${i}` : undefined,
        location: i % 4 === 0 ? "New York, NY" : undefined,
        takenAt: new Date(Date.now() - i * 3600000).toISOString(),
        realmojis: [],
        comments: Math.floor(Math.random() * 10)
      });
    }
    
    return posts;
  }

  // Get single post details - mock implementation for development
  async getPostById(postId: string): Promise<BeRealPost | null> {
    try {
      // For development, just generate a single mock post
      const mockPosts = this.generateMockPosts(1);
      const mockPost = mockPosts[0];
      mockPost.id = postId;
      return mockPost;
      
      /* Real implementation (currently disabled due to CORS):
      const data = await this.request(`/content/posts/${postId}`);
      return {
        id: data.id,
        user: {
          id: data.user.id,
          username: data.user.username,
          profilePicture: data.user.profilePicture?.url
        },
        primary: data.photoURL,
        secondary: data.secondaryPhotoURL,
        caption: data.caption,
        location: data.location?.name,
        takenAt: data.takenAt,
        realmojis: data.realmojis || [],
        comments: data.comment?.count || 0
      };
      */
    } catch (error) {
      console.error(`Failed to get post ${postId}:`, error);
      return null;
    }
  }

  // Add a RealMoji reaction to a post
  async addRealMoji(postId: string, imageUrl: string, type: string): Promise<boolean> {
    try {
      await this.request(`/content/realmojis`, {
        method: "POST",
        body: JSON.stringify({
          postId,
          imageUrl,
          type
        })
      });
      return true;
    } catch (error) {
      console.error("Failed to add RealMoji:", error);
      return false;
    }
  }

  // Get comments for a post
  async getComments(postId: string): Promise<any[]> {
    try {
      const data = await this.request(`/content/comments?postId=${postId}`);
      return data.comments;
    } catch (error) {
      console.error(`Failed to get comments for post ${postId}:`, error);
      return [];
    }
  }

  // Add a comment to a post
  async addComment(postId: string, comment: string): Promise<boolean> {
    try {
      await this.request(`/content/comments`, {
        method: "POST",
        body: JSON.stringify({
          postId,
          content: comment
        })
      });
      return true;
    } catch (error) {
      console.error("Failed to add comment:", error);
      return false;
    }
  }
}

// Create and export a singleton instance
export const beRealApi = new BeRealApiService();
