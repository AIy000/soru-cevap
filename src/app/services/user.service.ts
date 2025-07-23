import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private storageService: StorageService) {}

  getUserByUsername(username: string): User | null {
    const users = this.storageService.getUsers();
    return users.find(u => u.username === username) || null;
  }

  updateUserReputation(username: string, points: number): void {
    const users = this.storageService.getUsers();
    const userIndex = users.findIndex(u => u.username === username);
    
    if (userIndex !== -1) {
      users[userIndex].reputation += points;
      
      // Badge kontrolü
      const user = users[userIndex];
      if (user.reputation >= 100 && !user.badges.includes('Gümüş Rozet')) {
        user.badges.push('Gümüş Rozet');
      }
      if (user.reputation >= 500 && !user.badges.includes('Altın Rozet')) {
        user.badges.push('Altın Rozet');
      }
      if (user.reputation >= 1000 && !user.badges.includes('Platin Rozet')) {
        user.badges.push('Platin Rozet');
      }
      
      this.storageService.setUsers(users);
    }
  }

  getAllUsers(): User[] {
    return this.storageService.getUsers();
  }
}