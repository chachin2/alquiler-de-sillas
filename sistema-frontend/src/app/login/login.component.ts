import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';
  loading = false;

  constructor(private authService: AuthService) {}

  async onLogin(event: Event) {
    event.preventDefault();
    if (!this.username || !this.password) {
      this.error = 'Por favor ingrese usuario y contraseña';
      return;
    }
    
    this.loading = true;
    this.error = '';
    
    const success = await this.authService.login(this.username, this.password);
    if (!success) {
      this.error = 'Credenciales incorrectas';
    }
    this.loading = false;
  }
}
