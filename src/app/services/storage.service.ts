import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly USERS_KEY = 'qa_users';
  private readonly QUESTIONS_KEY = 'qa_questions';
  private readonly CURRENT_USER_KEY = 'qa_current_user';

  constructor() {
    this.initializeStorage();
  }

  private initializeStorage(): void {
    if (!localStorage.getItem(this.USERS_KEY)) {
      const defaultUsers = [
        {
          id: '1',
          username: 'admin',
          password: '123456',
          role: 'moderator',
          reputation: 1000,
          badges: ['Altın Moderatör', 'Platform Kurucusu'],
          createdAt: new Date()
        },
        {
          id: '2',
          username: 'kullanici1',
          password: '123456',
          role: 'normal',
          reputation: 50,
          badges: ['Yeni Üye'],
          createdAt: new Date()
        }
      ];
      this.setItem(this.USERS_KEY, defaultUsers);
    }

    if (!localStorage.getItem(this.QUESTIONS_KEY)) {
      const defaultQuestions = [
        {
          id: '1',
          title: 'Angular nedir ve nasıl kullanılır?',
          body: 'Angular framework hakkında detaylı bilgi almak istiyorum. Temel özellikleri ve avantajları nelerdir?',
          authorUsername: 'kullanici1',
          tags: ['angular', 'frontend', 'typescript'],
          likes: 5,
          views: 25,
          answers: [
            {
              id: '1',
              questionId: '1',
              authorUsername: 'admin',
              body: 'Angular, Google tarafından geliştirilen güçlü bir frontend framework\'üdür. TypeScript ile yazılır ve component-based mimariyi kullanır.',
              likes: 3,
              isAccepted: true,
              createdAt: new Date()
            }
          ],
          createdAt: new Date()
        }
      ];
      this.setItem(this.QUESTIONS_KEY, defaultQuestions);
    }
  }

  setItem(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  getItem<T>(key: string): T | null {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  // Specific methods
  getUsers(): any[] {
    return this.getItem(this.USERS_KEY) || [];
  }

  setUsers(users: any[]): void {
    this.setItem(this.USERS_KEY, users);
  }

  getQuestions(): any[] {
    return this.getItem(this.QUESTIONS_KEY) || [];
  }

  setQuestions(questions: any[]): void {
    this.setItem(this.QUESTIONS_KEY, questions);
  }

  getCurrentUser(): any | null {
    return this.getItem(this.CURRENT_USER_KEY);
  }

  setCurrentUser(user: any): void {
    this.setItem(this.CURRENT_USER_KEY, user);
  }

  clearCurrentUser(): void {
    this.removeItem(this.CURRENT_USER_KEY);
  }
}