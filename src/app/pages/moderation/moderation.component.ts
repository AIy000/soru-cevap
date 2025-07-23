import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { QuestionService } from '../../services/question.service';
import { UserService } from '../../services/user.service';
import { Question } from '../../models/question.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-moderation',
  templateUrl: './moderation.component.html',
  styleUrls: ['./moderation.component.scss']
})
export class ModerationComponent implements OnInit {
  questions: Question[] = [];
  users: User[] = [];
  activeTab: 'questions' | 'users' = 'questions';
  
  // Confirm dialog
  showDeleteDialog = false;
  selectedQuestionId = '';
  selectedQuestionTitle = '';

  constructor(
    private router: Router,
    private questionService: QuestionService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.questions = this.questionService.getAllQuestions()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    this.users = this.userService.getAllUsers()
      .sort((a, b) => b.reputation - a.reputation);
  }

  setActiveTab(tab: 'questions' | 'users'): void {
    this.activeTab = tab;
  }

  editQuestion(questionId: string): void {
    this.router.navigate(['/question', questionId, 'edit']);
  }

  showDeleteQuestionDialog(questionId: string, questionTitle: string): void {
    this.selectedQuestionId = questionId;
    this.selectedQuestionTitle = questionTitle;
    this.showDeleteDialog = true;
  }

  deleteQuestion(): void {
    if (this.selectedQuestionId) {
      this.questionService.deleteQuestion(this.selectedQuestionId);
      this.loadData();
    }
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Az önce';
    if (diffMins < 60) return `${diffMins} dakika önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    return `${diffDays} gün önce`;
  }

  getTotalAnswers(): number {
    return this.questions.reduce((total, q) => total + q.answers.length, 0);
  }

  getTotalViews(): number {
    return this.questions.reduce((total, q) => total + q.views, 0);
  }

  getTotalLikes(): number {
    const questionLikes = this.questions.reduce((total, q) => total + q.likes, 0);
    const answerLikes = this.questions.reduce((total, q) => 
      total + q.answers.reduce((answerTotal, a) => answerTotal + a.likes, 0), 0);
    return questionLikes + answerLikes;
  }
}