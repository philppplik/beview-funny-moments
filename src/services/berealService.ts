
// This is a mock service that simulates fetching data from the BeReal API
// In a real application, this would use actual API calls

import { faker } from "@faker-js/faker";

// Seed the faker to get consistent results
faker.seed(123);

interface BeRealPost {
  id: string;
  username: string;
  userAvatar: string;
  caption?: string;
  mainPhoto: string;
  selfiePhoto: string;
  location?: string;
  timestamp: string;
  likes: number;
  comments: number;
}

// Generate a mock BeReal post
function generateMockPost(id: number): BeRealPost {
  const username = faker.internet.userName();
  const date = faker.date.recent({ days: 7 });
  const hasLocation = faker.datatype.boolean(0.7);
  const hasCaption = faker.datatype.boolean(0.8);
  
  return {
    id: `post_${id}`,
    username,
    userAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    caption: hasCaption ? faker.lorem.sentence(5) : undefined,
    mainPhoto: `https://picsum.photos/seed/${id}/600/750`,
    selfiePhoto: `https://picsum.photos/seed/${id+100}/200/200`,
    location: hasLocation ? faker.location.city() : undefined,
    timestamp: formatTimestamp(date),
    likes: faker.number.int({ min: 1, max: 100 }),
    comments: faker.number.int({ min: 0, max: 30 }),
  };
}

// Format timestamp relative to now
function formatTimestamp(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`;
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

// Generate an array of mock posts
export async function getFeedPosts(page = 1, limit = 10): Promise<BeRealPost[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const startIndex = (page - 1) * limit;
  const posts: BeRealPost[] = [];
  
  for (let i = 0; i < limit; i++) {
    posts.push(generateMockPost(startIndex + i));
  }
  
  return posts;
}

// Get a specific post by ID
export async function getPostById(id: string): Promise<BeRealPost | null> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Extract the numeric part from the ID
  const postNumber = parseInt(id.replace('post_', ''));
  
  if (isNaN(postNumber)) {
    return null;
  }
  
  return generateMockPost(postNumber);
}

// Like a post (in a real app, this would call an API)
export async function likePost(id: string): Promise<boolean> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Simulate success most of the time
  return Math.random() > 0.1;
}

// Add a comment to a post (in a real app, this would call an API)
export async function commentOnPost(id: string, comment: string): Promise<boolean> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 700));
  
  // Simulate success most of the time
  return Math.random() > 0.1;
}
