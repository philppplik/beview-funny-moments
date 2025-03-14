
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

export interface OTPResponse {
  success: boolean;
  message?: string;
}
