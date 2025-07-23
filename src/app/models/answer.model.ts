export interface Answer {
  id: string;
  questionId: string;
  authorUsername: string;
  body: string;
  likes: number;
  isAccepted: boolean;
  createdAt: Date;
}