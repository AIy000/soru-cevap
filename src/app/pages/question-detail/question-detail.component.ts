import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionService } from '../../services/question.service';
import { AuthService } from '../../services/auth.service';
import { Question } from '../../models/question.model';
import { Answer } from '../../models/answer.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-question-detail',
  templateUrl: './question-detail.component.html',
  styleUrls: ['./question-detail.component.scss']
})
export class QuestionDetailComponent implements OnInit {
  question: Question | null = null;
  currentUser: User | null = null;
  newAnswer = '';
  isSubmittingAnswer = false;
  errorMessage = '';
  
  // Confirm dialog için
  showDeleteDialog = false;
  showAcceptDialog = false;
  showDeleteAnswerConfirm = false;
  selectedAnswerId = '';
  
  // Edit için
  editingAnswerId = '';
  editAnswerText = '';
  originalAnswerText = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private questionService: QuestionService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    this.route.paramMap.subscribe(params => {
      const questionId = params.get('id');
      if (questionId) {
        this.loadQuestion(questionId);
      } else {
        this.router.navigate(['/home']);
      }
    });
  }

  private loadQuestion(questionId: string): void {
    this.question = this.questionService.getQuestionById(questionId);
    
    if (!this.question) {
      this.router.navigate(['/home']);
      return;
    }

    // Görüntülenme sayısını artır
    this.questionService.incrementViews(questionId);
    
    // Güncel veriyi al
    this.question = this.questionService.getQuestionById(questionId);
  }

  likeQuestion(): void {
    if (!this.currentUser || !this.question) return;
    
    this.questionService.likeQuestion(this.question.id);
    this.question = this.questionService.getQuestionById(this.question.id);
  }

  submitAnswer(): void {
    if (!this.currentUser || !this.question || !this.newAnswer.trim()) return;

    if (this.newAnswer.trim().length < 10) {
      this.errorMessage = 'Cevap en az 10 karakter olmalıdır.';
      return;
    }

    this.isSubmittingAnswer = true;
    this.errorMessage = '';

    const success = this.questionService.addAnswer(
      this.question.id,
      this.newAnswer.trim(),
      this.currentUser.username
    );

    if (success) {
      this.newAnswer = '';
      this.question = this.questionService.getQuestionById(this.question.id);
    } else {
      this.errorMessage = 'Cevap eklenirken bir hata oluştu.';
    }

    this.isSubmittingAnswer = false;
  }

  likeAnswer(answerId: string): void {
    if (!this.currentUser || !this.question) return;
    
    this.questionService.likeAnswer(this.question.id, answerId);
    this.question = this.questionService.getQuestionById(this.question.id);
  }

  canEditQuestion(): boolean {
    if (!this.currentUser || !this.question) return false;
    
    return this.currentUser.role === 'moderator' || 
           this.currentUser.username === this.question.authorUsername;
  }

  canEditAnswer(answer: Answer): boolean {
    if (!this.currentUser) return false;
    
    return this.currentUser.role === 'moderator' || 
           this.currentUser.username === answer.authorUsername;
  }

  editQuestion(): void {
    if (this.question) {
      this.router.navigate(['/question', this.question.id, 'edit']);
    }
  }

  startEditingAnswer(answerId: string, currentText: string): void {
    this.editingAnswerId = answerId;
    this.editAnswerText = currentText;
    this.originalAnswerText = currentText;
  }

  cancelEditingAnswer(): void {
    this.editingAnswerId = '';
    this.editAnswerText = '';
    this.originalAnswerText = '';
  }

  saveEditedAnswer(): void {
    if (!this.question || !this.editingAnswerId || !this.editAnswerText.trim()) return;

    if (this.editAnswerText.trim().length < 10) {
      this.errorMessage = 'Cevap en az 10 karakter olmalıdır.';
      return;
    }

    const success = this.questionService.updateAnswer(
      this.question.id,
      this.editingAnswerId,
      this.editAnswerText.trim()
    );

    if (success) {
      this.question = this.questionService.getQuestionById(this.question.id);
      this.cancelEditingAnswer();
      this.errorMessage = '';
    } else {
      this.errorMessage = 'Cevap güncellenirken bir hata oluştu.';
    }
  }

  showDeleteAnswerDialog(answerId: string): void {
    this.selectedAnswerId = answerId;
    this.showDeleteAnswerConfirm = true;
  }

  deleteAnswer(): void {
    if (!this.question || !this.selectedAnswerId) return;
    
    const success = this.questionService.deleteAnswer(this.question.id, this.selectedAnswerId);
    if (success) {
      this.question = this.questionService.getQuestionById(this.question.id);
    }
  }

  showAcceptAnswerDialog(answerId: string): void {
    this.selectedAnswerId = answerId;
    this.showAcceptDialog = true;
  }

  acceptAnswer(): void {
    if (!this.currentUser || !this.question || !this.selectedAnswerId) return;
    
    const success = this.questionService.acceptAnswer(
      this.question.id,
      this.selectedAnswerId,
      this.currentUser.username
    );

    if (success) {
      this.question = this.questionService.getQuestionById(this.question.id);
    }
  }

  canDeleteQuestion(): boolean {
    return this.currentUser?.username === this.question?.authorUsername ||
           this.currentUser?.role === 'moderator';
  }

  showDeleteQuestionDialog(): void {
    this.showDeleteDialog = true;
  }

  deleteQuestion(): void {
    if (!this.question) return;
    
    const success = this.questionService.deleteQuestion(this.question.id);
    if (success) {
      this.router.navigate(['/home']);
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

  getSortedAnswers(): Answer[] {
    if (!this.question?.answers) return [];
    
    return [...this.question.answers].sort((a, b) => {
      // Önce kabul edilmiş cevaplar
      if (a.isAccepted && !b.isAccepted) return -1;
      if (!a.isAccepted && b.isAccepted) return 1;
      
      // Sonra beğeni sayısına göre
      if (a.likes !== b.likes) return b.likes - a.likes;
      
      // Son olarak tarihe göre
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }

  navigateToProfile(username: string): void {
    if (this.currentUser) {
      this.router.navigate(['/profile', username]);
    }
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }
}