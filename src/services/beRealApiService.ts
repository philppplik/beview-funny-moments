
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

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers
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
  }

  // Authenticate with OTP
  async sendOTP(phoneNumber: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/person/otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          phoneNumber
        })
      });

      return response.ok;
    } catch (error) {
      console.error("Failed to send OTP:", error);
      return false;
    }
  }

  // Verify OTP and login
  async verifyOTP(phoneNumber: string, code: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/person/otp/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          phoneNumber,
          code
        })
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
      const response = await fetch(`${this.baseURL}/person/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          refreshToken
        })
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

  // Get friends feed
  async getFriendsFeed(page = 0): Promise<BeRealPost[]> {
    try {
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
    } catch (error) {
      console.error("Failed to get friends feed:", error);
      return [];
    }
  }

  // Get discovery feed (public posts)
  async getDiscoveryFeed(page = 0): Promise<BeRealPost[]> {
    try {
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
    } catch (error) {
      console.error("Failed to get discovery feed:", error);
      return [];
    }
  }

  // Get single post details
  async getPostById(postId: string): Promise<BeRealPost | null> {
    try {
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
