import { Answer } from './answer.model';

export interface Question {
  id: string;
  title: string;
  body: string;
  authorUsername: string;
  tags: string[];
  likes: number;
  views: number;
  answers: Answer[];
  createdAt: Date;
}