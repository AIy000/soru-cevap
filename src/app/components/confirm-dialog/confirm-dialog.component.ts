import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent {
  @Input() isOpen = false;
  @Input() title = 'Onay';
  @Input() message = 'Bu işlemi gerçekleştirmek istediğinizden emin misiniz?';
  @Input() confirmText = 'Evet';
  @Input() cancelText = 'Hayır';
  @Input() type: 'warning' | 'danger' | 'info' = 'warning';

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm(): void {
    this.confirmed.emit();
    this.close();
  }

  onCancel(): void {
    this.cancelled.emit();
    this.close();
  }

  close(): void {
    this.isOpen = false;
  }
}