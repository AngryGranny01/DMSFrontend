import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../service/auth.service';
import { LogDataService } from '../service/api/log-data.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css'],
})
export class LoginPageComponent {
  constructor(private authService: AuthService, private logDataService: LogDataService) {}

  ngOnInit() {}

  onSignIn(form: NgForm) {
    const email = form.value.email;
    const password = form.value.password;

    if (!email || !password) {
      alert('Please enter both email and password');
      return;
    }

    this.authService.loginUser(email, password).subscribe(
      (response) => {
        if (response) {
          // Handle successful login response
          console.log('Login successful:', response);
        } else {
          alert('Failed to login. Please try again later.');
        }
      },
      (error) => {
        // Handle login error
        if (error.status === 401) {
          alert('Invalid Login Data. Please try again.');
        } else if (error.status === 404) {
          alert('User not found.');
        } else if (error.status === 500) {
          alert('Internal server error. Please try again later.');
        } else {
          alert('Failed to login. Please try again later.');
        }
        console.error('Login error:', error);
      }
    );
  }
}
