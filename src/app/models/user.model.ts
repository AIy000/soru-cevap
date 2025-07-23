export interface User {
  id: string;
  username: string;
  password: string;
  role: 'moderator' | 'normal';
  reputation: number;
  badges: string[];
  createdAt: Date;
}