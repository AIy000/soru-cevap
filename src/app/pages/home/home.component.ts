import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { QuestionService } from '../../services/question.service';
import { AuthService } from '../../services/auth.service';
import { Question } from '../../models/question.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  questions: Question[] = [];
  popularTags: { tag: string; count: number }[] = [];
  sortBy: 'latest' | 'popular' | 'mostViewed' = 'latest';
  searchTerm = '';
  filteredQuestions: Question[] = [];
  isLoggedIn = false;

  constructor(
    private questionService: QuestionService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.loadQuestions();
    this.loadPopularTags();
  }

  loadQuestions(): void {
    this.questions = this.questionService.getAllQuestions();
    this.applySorting();
  }

  loadPopularTags(): void {
    this.popularTags = this.questionService.getPopularTags(8);
  }

  applySorting(): void {
    let sortedQuestions = [...this.questions];

    switch (this.sortBy) {
      case 'latest':
        sortedQuestions.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'popular':
        sortedQuestions.sort((a, b) => b.likes - a.likes);
        break;
      case 'mostViewed':
        sortedQuestions.sort((a, b) => b.views - a.views);
        break;
    }

    this.filteredQuestions = sortedQuestions;
    this.applySearch();
  }

  applySearch(): void {
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      this.filteredQuestions = this.filteredQuestions.filter(q => 
        q.title.toLowerCase().includes(searchLower) ||
        q.body.toLowerCase().includes(searchLower) ||
        q.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
  }

  onSortChange(): void {
    this.applySorting();
  }

  onSearch(): void {
    this.applySorting();
  }

  navigateToQuestion(questionId: string): void {
    this.router.navigate(['/question', questionId]);
  }

  navigateToAsk(): void {
    if (this.isLoggedIn) {
      this.router.navigate(['/ask']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  filterByTag(tag: string): void {
    this.searchTerm = tag;
    this.onSearch();
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} dakika önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    return `${diffDays} gün önce`;
  }

  getTotalAnswers(): number {
    return this.questions.reduce((total, q) => total + q.answers.length, 0);
  }
}