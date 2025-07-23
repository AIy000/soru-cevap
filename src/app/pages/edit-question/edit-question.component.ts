import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionService } from '../../services/question.service';
import { AuthService } from '../../services/auth.service';
import { Question } from '../../models/question.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-edit-question',
  templateUrl: './edit-question.component.html',
  styleUrls: ['./edit-question.component.scss']
})
export class EditQuestionComponent implements OnInit {
  question: Question | null = null;
  currentUser: User | null = null;
  
  title = '';
  body = '';
  tags = '';
  
  isSubmitting = false;
  errorMessage = '';
  
  // Öneri etiketleri
  suggestedTags = [
    'angular', 'react', 'javascript', 'typescript', 'css', 'html',
    'nodejs', 'python', 'java', 'csharp', 'php', 'sql',
    'frontend', 'backend', 'fullstack', 'ui-ux', 'web-development',
    'mobile', 'android', 'ios', 'flutter', 'react-native'
  ];

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

    // Yetki kontrolü
    if (!this.canEditQuestion()) {
      this.router.navigate(['/question', questionId]);
      return;
    }

    // Form alanlarını doldur
    this.title = this.question.title;
    this.body = this.question.body;
    this.tags = this.question.tags.join(', ');
  }

  canEditQuestion(): boolean {
    if (!this.currentUser || !this.question) return false;
    
    return this.currentUser.role === 'moderator' || 
           this.currentUser.username === this.question.authorUsername;
  }

  onSubmit(): void {
    this.errorMessage = '';

    // Validasyon
    if (!this.title.trim()) {
      this.errorMessage = 'Soru başlığı gereklidir.';
      return;
    }

    if (this.title.trim().length < 10) {
      this.errorMessage = 'Soru başlığı en az 10 karakter olmalıdır.';
      return;
    }

    if (!this.body.trim()) {
      this.errorMessage = 'Soru açıklaması gereklidir.';
      return;
    }

    if (this.body.trim().length < 20) {
      this.errorMessage = 'Soru açıklaması en az 20 karakter olmalıdır.';
      return;
    }

    if (!this.question) return;

    this.isSubmitting = true;

    // Etiketleri işle
    const processedTags = this.processTags();
    
    try {
      const success = this.questionService.updateQuestion(this.question.id, {
        title: this.title.trim(),
        body: this.body.trim(),
        tags: processedTags
      });

      if (success) {
        // Başarılı, soru detay sayfasına yönlendir
        this.router.navigate(['/question', this.question.id]);
      } else {
        this.errorMessage = 'Soru güncellenirken bir hata oluştu.';
        this.isSubmitting = false;
      }
    } catch (error) {
      this.errorMessage = 'Soru güncellenirken bir hata oluştu. Lütfen tekrar deneyin.';
      this.isSubmitting = false;
    }
  }

  private processTags(): string[] {
    if (!this.tags.trim()) return [];
    
    return this.tags
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0)
      .filter((tag, index, arr) => arr.indexOf(tag) === index) // Dublicateları kaldır
      .slice(0, 5); // Maximum 5 etiket
  }

  addSuggestedTag(tag: string): void {
    const currentTags = this.processTags();
    
    if (currentTags.length >= 5) {
      return; // Maximum 5 etiket
    }

    if (!currentTags.includes(tag)) {
      if (this.tags.trim()) {
        this.tags += ', ' + tag;
      } else {
        this.tags = tag;
      }
    }
  }

  removeSuggestedTag(tagToRemove: string): void {
    const currentTags = this.processTags();
    const updatedTags = currentTags.filter(tag => tag !== tagToRemove);
    this.tags = updatedTags.join(', ');
  }

  getCurrentTags(): string[] {
    return this.processTags();
  }

  getCharacterCount(text: string): number {
    return text.trim().length;
  }

  isTagSelected(tag: string): boolean {
    return this.getCurrentTags().includes(tag);
  }

  goBack(): void {
    if (this.question) {
      this.router.navigate(['/question', this.question.id]);
    } else {
      this.router.navigate(['/home']);
    }
  }
}