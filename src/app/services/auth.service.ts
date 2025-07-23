import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageService } from './storage.service';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private storageService: StorageService) {
    const user = this.storageService.getCurrentUser();
    if (user) {
      this.currentUserSubject.next(user);
    }
  }

  login(username: string, password: string): boolean {
    const users = this.storageService.getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      this.storageService.setCurrentUser(user);
      this.currentUserSubject.next(user);
      return true;
    }
    return false;
  }

  logout(): void {
    this.storageService.clearCurrentUser();
    this.currentUserSubject.next(null);
  }

  register(username: string, password: string): boolean {
    const users = this.storageService.getUsers();
    
    if (users.find(u => u.username === username)) {
      return false; // Username already exists
    }

    const newUser: User = {
      id: Date.now().toString(),
      username,
      password,
      role: 'normal',
      reputation: 0,
      badges: ['Yeni Üye'],
      createdAt: new Date()
    };

    users.push(newUser);
    this.storageService.setUsers(users);
    return true;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  isModerator(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'moderator';
  }
}