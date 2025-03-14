
import { BeRealPost } from "../types/beRealTypes";
import { PROXY_URL, BEREAL_API_BASE_URL, handleApiResponse } from "./apiUtils";
import { beRealAuth } from "./beRealAuthService";

class BeRealContentService {
  // Helper for making authenticated requests
  private async request(endpoint: string, options: RequestInit = {}) {
    const token = beRealAuth.getToken();
    if (!token) {
      throw new Error("Not authenticated");
    }

    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      ...options.headers
    };

    try {
      const response = await fetch(`${PROXY_URL}${BEREAL_API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        mode: 'cors'
      });

      if (response.status === 401) {
        // Token expired, try to refresh
        const refreshSuccess = await beRealAuth.refreshToken();
        if (refreshSuccess) {
          // Retry the request
          return this.request(endpoint, options);
        } else {
          throw new Error("Authentication failed");
        }
      }

      return handleApiResponse(response);
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Get friends feed
  async getFriendsFeed(page = 0): Promise<BeRealPost[]> {
    try {
      // Mock data for development
      if (process.env.NODE_ENV === 'development') {
        return this.generateMockPosts(8);
      }
      
      // Real API implementation
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
      // Mock data for development
      if (process.env.NODE_ENV === 'development') {
        return this.generateMockPosts(12);
      }
      
      // Real API implementation
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
      // For development, just generate a single mock post
      if (process.env.NODE_ENV === 'development') {
        const mockPosts = this.generateMockPosts(1);
        const mockPost = mockPosts[0];
        mockPost.id = postId;
        return mockPost;
      }
      
      // Real API implementation
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
}

// Create and export singleton instance
export const beRealContent = new BeRealContentService();
