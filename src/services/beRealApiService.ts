
import { beRealAuth } from './beRealAuthService';
import { beRealContent } from './beRealContentService';

// Re-export all services from a single file for backward compatibility
export const beRealApi = {
  // Auth methods
  sendOTP: beRealAuth.sendOTP.bind(beRealAuth),
  verifyOTP: beRealAuth.verifyOTP.bind(beRealAuth),
  refreshToken: beRealAuth.refreshToken.bind(beRealAuth),
  logout: beRealAuth.logout.bind(beRealAuth),
  isAuthenticated: beRealAuth.isAuthenticated.bind(beRealAuth),
  
  // Content methods
  getFriendsFeed: beRealContent.getFriendsFeed.bind(beRealContent),
  getDiscoveryFeed: beRealContent.getDiscoveryFeed.bind(beRealContent),
  getPostById: beRealContent.getPostById.bind(beRealContent),
  addRealMoji: beRealContent.addRealMoji.bind(beRealContent),
  getComments: beRealContent.getComments.bind(beRealContent),
  addComment: beRealContent.addComment.bind(beRealContent)
};

// Re-export the types from types/beRealTypes.ts for backward compatibility
export type { BeRealUser, BeRealPost, BeRealAuthResponse } from '../types/beRealTypes';
