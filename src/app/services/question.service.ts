import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { UserService } from './user.service';
import { Question } from '../models/question.model';
import { Answer } from '../models/answer.model';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  constructor(
    private storageService: StorageService,
    private userService: UserService
  ) {}

  getAllQuestions(): Question[] {
    return this.storageService.getQuestions();
  }

  getQuestionById(id: string): Question | null {
    const questions = this.storageService.getQuestions();
    return questions.find(q => q.id === id) || null;
  }

  addQuestion(title: string, body: string, tags: string[], authorUsername: string): string {
    const questions = this.storageService.getQuestions();
    const newQuestion: Question = {
      id: Date.now().toString(),
      title,
      body,
      authorUsername,
      tags,
      likes: 0,
      views: 0,
      answers: [],
      createdAt: new Date()
    };

    questions.push(newQuestion);
    this.storageService.setQuestions(questions);
    return newQuestion.id;
  }

  updateQuestion(questionId: string, updates: Partial<Question>): boolean {
    const questions = this.storageService.getQuestions();
    const questionIndex = questions.findIndex(q => q.id === questionId);
    
    if (questionIndex !== -1) {
      questions[questionIndex] = { ...questions[questionIndex], ...updates };
      this.storageService.setQuestions(questions);
      return true;
    }
    return false;
  }

  updateAnswer(questionId: string, answerId: string, newBody: string): boolean {
    const questions = this.storageService.getQuestions();
    const questionIndex = questions.findIndex(q => q.id === questionId);
    
    if (questionIndex !== -1) {
      const answerIndex = questions[questionIndex].answers.findIndex((a: { id: string; }) => a.id === answerId);
      if (answerIndex !== -1) {
        questions[questionIndex].answers[answerIndex].body = newBody;
        this.storageService.setQuestions(questions);
        return true;
      }
    }
    return false;
  }

  deleteAnswer(questionId: string, answerId: string): boolean {
    const questions = this.storageService.getQuestions();
    const questionIndex = questions.findIndex(q => q.id === questionId);
    
    if (questionIndex !== -1) {
      const originalLength = questions[questionIndex].answers.length;
      questions[questionIndex].answers = questions[questionIndex].answers.filter((a: { id: string; }) => a.id !== answerId);
      
      if (questions[questionIndex].answers.length !== originalLength) {
        this.storageService.setQuestions(questions);
        return true;
      }
    }
    return false;
  }

  deleteQuestion(questionId: string): boolean {
    const questions = this.storageService.getQuestions();
    const filteredQuestions = questions.filter(q => q.id !== questionId);
    
    if (filteredQuestions.length !== questions.length) {
      this.storageService.setQuestions(filteredQuestions);
      return true;
    }
    return false;
  }

  incrementViews(questionId: string): void {
    const questions = this.storageService.getQuestions();
    const questionIndex = questions.findIndex(q => q.id === questionId);
    
    if (questionIndex !== -1) {
      questions[questionIndex].views++;
      this.storageService.setQuestions(questions);
    }
  }

  likeQuestion(questionId: string): void {
    const questions = this.storageService.getQuestions();
    const questionIndex = questions.findIndex(q => q.id === questionId);
    
    if (questionIndex !== -1) {
      questions[questionIndex].likes++;
      this.storageService.setQuestions(questions);
      
      // Soru sahibine puan ver
      this.userService.updateUserReputation(questions[questionIndex].authorUsername, 5);
    }
  }

  addAnswer(questionId: string, body: string, authorUsername: string): boolean {
    const questions = this.storageService.getQuestions();
    const questionIndex = questions.findIndex(q => q.id === questionId);
    
    if (questionIndex !== -1) {
      const newAnswer: Answer = {
        id: Date.now().toString(),
        questionId,
        authorUsername,
        body,
        likes: 0,
        isAccepted: false,
        createdAt: new Date()
      };

      questions[questionIndex].answers.push(newAnswer);
      this.storageService.setQuestions(questions);
      
      // Cevap verene puan ver
      this.userService.updateUserReputation(authorUsername, 10);
      return true;
    }
    return false;
  }

  likeAnswer(questionId: string, answerId: string): void {
    const questions = this.storageService.getQuestions();
    const questionIndex = questions.findIndex(q => q.id === questionId);
    
    if (questionIndex !== -1) {
      const answerIndex = questions[questionIndex].answers.findIndex((a: { id: string; }) => a.id === answerId);
      if (answerIndex !== -1) {
        questions[questionIndex].answers[answerIndex].likes++;
        this.storageService.setQuestions(questions);
        
        // Cevap sahibine puan ver
        const answerAuthor = questions[questionIndex].answers[answerIndex].authorUsername;
        this.userService.updateUserReputation(answerAuthor, 2);
      }
    }
  }

  acceptAnswer(questionId: string, answerId: string, currentUsername: string): boolean {
    const questions = this.storageService.getQuestions();
    const questionIndex = questions.findIndex(q => q.id === questionId);
    
    if (questionIndex !== -1 && questions[questionIndex].authorUsername === currentUsername) {
      // Önce tüm cevapları unaccept yap
      questions[questionIndex].answers.forEach((a: { isAccepted: boolean; }) => a.isAccepted = false);
      
      // Seçilen cevabı accept yap
      const answerIndex = questions[questionIndex].answers.findIndex((a: { id: string; }) => a.id === answerId);
      if (answerIndex !== -1) {
        questions[questionIndex].answers[answerIndex].isAccepted = true;
        this.storageService.setQuestions(questions);
        
        // Kabul edilen cevap sahibine bonus puan ver
        const answerAuthor = questions[questionIndex].answers[answerIndex].authorUsername;
        this.userService.updateUserReputation(answerAuthor, 15);
        return true;
      }
    }
    return false;
  }

  getPopularQuestions(limit: number = 10): Question[] {
    const questions = this.getAllQuestions();
    return questions
      .sort((a, b) => (b.likes + b.views) - (a.likes + a.views))
      .slice(0, limit);
  }

  getQuestionsByUser(username: string): Question[] {
    const questions = this.getAllQuestions();
    return questions.filter(q => q.authorUsername === username);
  }

  getPopularTags(limit: number = 10): { tag: string; count: number }[] {
    const questions = this.getAllQuestions();
    const tagCounts: { [key: string]: number } = {};
    
    questions.forEach(q => {
      q.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    
    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
}