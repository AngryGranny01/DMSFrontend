import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../service/auth.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
})
export class LoginPageComponent {
  constructor(private authService: AuthService) {}

  ngOnInit() {}

  onSignIn(form: NgForm) {
    const username = form.value.username;
    const password = form.value.password;
    this.authService.loginUsers(username, password);
  }
}
