import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { QuestionService } from '../../services/question.service';
import { User } from '../../models/user.model';
import { Question } from '../../models/question.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  currentUser: User | null = null;
  userQuestions: Question[] = [];
  userAnswers: any[] = [];
  activeTab: 'questions' | 'answers' | 'badges' = 'questions';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private questionService: QuestionService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    this.route.paramMap.subscribe(params => {
      const username = params.get('username');
      if (username) {
        this.loadUserProfile(username);
      } else {
        this.router.navigate(['/home']);
      }
    });
  }

  private loadUserProfile(username: string): void {
    this.user = this.userService.getUserByUsername(username);
    
    if (!this.user) {
      this.router.navigate(['/home']);
      return;
    }

    // Kullanıcının sorularını yükle
    this.userQuestions = this.questionService.getQuestionsByUser(username);
    
    // Kullanıcının cevaplarını yükle
    this.loadUserAnswers(username);
  }

  private loadUserAnswers(username: string): void {
    const allQuestions = this.questionService.getAllQuestions();
    this.userAnswers = [];

    allQuestions.forEach(question => {
      question.answers.forEach(answer => {
        if (answer.authorUsername === username) {
          this.userAnswers.push({
            ...answer,
            questionTitle: question.title,
            questionId: question.id
          });
        }
      });
    });

    // Tarihe göre sırala (en yeni önce)
    this.userAnswers.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  setActiveTab(tab: 'questions' | 'answers' | 'badges'): void {
    this.activeTab = tab;
  }

  navigateToQuestion(questionId: string): void {
    this.router.navigate(['/question', questionId]);
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

  getTotalLikes(): number {
    const questionLikes = this.userQuestions.reduce((total, q) => total + q.likes, 0);
    const answerLikes = this.userAnswers.reduce((total, a) => total + a.likes, 0);
    return questionLikes + answerLikes;
  }

  getAcceptedAnswersCount(): number {
    return this.userAnswers.filter(a => a.isAccepted).length;
  }
}