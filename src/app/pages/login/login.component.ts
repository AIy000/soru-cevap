import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  username = '';
  password = '';
  confirmPassword = '';
  isRegisterMode = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.username.trim() || !this.password.trim()) {
      this.errorMessage = 'Kullanıcı adı ve şifre gereklidir.';
      return;
    }

    if (this.isRegisterMode) {
      this.register();
    } else {
      this.login();
    }
  }

  private login(): void {
    const success = this.authService.login(this.username.trim(), this.password);
    
    if (success) {
      this.router.navigate(['/home']);
    } else {
      this.errorMessage = 'Kullanıcı adı veya şifre hatalı!';
    }
  }

  private register(): void {
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Şifreler eşleşmiyor!';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Şifre en az 6 karakter olmalıdır!';
      return;
    }

    const success = this.authService.register(this.username.trim(), this.password);
    
    if (success) {
      this.successMessage = 'Hesap başarıyla oluşturuldu! Şimdi giriş yapabilirsiniz.';
      this.isRegisterMode = false;
      this.clearForm();
    } else {
      this.errorMessage = 'Bu kullanıcı adı zaten kullanımda!';
    }
  }

  toggleMode(): void {
    this.isRegisterMode = !this.isRegisterMode;
    this.clearForm();
    this.errorMessage = '';
    this.successMessage = '';
  }

  private clearForm(): void {
    this.username = '';
    this.password = '';
    this.confirmPassword = '';
  }

  // Demo kullanıcı girişi
  loginAsDemo(userType: 'admin' | 'user'): void {
    if (userType === 'admin') {
      this.username = 'admin';
      this.password = '123456';
    } else {
      this.username = 'kullanici1';
      this.password = '123456';
    }
    this.login();
  }
}