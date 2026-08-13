import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  template: `
    <app-login *ngIf="!isLoggedIn"></app-login>
    <app-alquiler *ngIf="isLoggedIn"></app-alquiler>
  `
})
export class AppComponent implements OnInit { 
  isLoggedIn = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
    });
  }
}
