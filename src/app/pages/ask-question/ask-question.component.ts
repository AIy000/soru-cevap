import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { QuestionService } from '../../services/question.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-ask-question',
  templateUrl: './ask-question.component.html',
  styleUrls: ['./ask-question.component.scss']
})
export class AskQuestionComponent {
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
    private questionService: QuestionService,
    private authService: AuthService,
    private router: Router
  ) {}

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

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.errorMessage = 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.';
      return;
    }

    this.isSubmitting = true;

    // Etiketleri işle
    const processedTags = this.processTags();
    
    try {
      const questionId = this.questionService.addQuestion(
        this.title.trim(),
        this.body.trim(),
        processedTags,
        currentUser.username
      );

      // Başarılı, soru detay sayfasına yönlendir
      this.router.navigate(['/question', questionId]);
    } catch (error) {
      this.errorMessage = 'Soru eklenirken bir hata oluştu. Lütfen tekrar deneyin.';
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
}