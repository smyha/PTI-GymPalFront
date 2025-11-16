export type UserProfile = {
  id: string;
  email: string;
  username: string;
  fullName?: string;
  bio?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  gender?: string;
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
  timezone?: string;
  language?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type UpdateProfileRequest = Partial<Omit<UserProfile, 'id' | 'email' | 'createdAt' | 'updatedAt'>>;

export type UserPreferences = {
  notifications_enabled: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  marketing_emails: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: string;
};
