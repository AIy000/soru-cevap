import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Question } from '../../models/question.model';

@Component({
  selector: 'app-question-card',
  templateUrl: './question-card.component.html',
  styleUrls: ['./question-card.component.scss']
})
export class QuestionCardComponent {
  @Input() question!: Question;
  @Input() showActions = false;
  
  @Output() questionClicked = new EventEmitter<string>();
  @Output() likeClicked = new EventEmitter<string>();
  @Output() deleteClicked = new EventEmitter<string>();

  onQuestionClick(): void {
    this.questionClicked.emit(this.question.id);
  }

  onLike(event: Event): void {
    event.stopPropagation();
    this.likeClicked.emit(this.question.id);
  }

  onDelete(event: Event): void {
    event.stopPropagation();
    this.deleteClicked.emit(this.question.id);
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
}