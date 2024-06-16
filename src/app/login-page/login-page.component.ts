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
  constructor(
    private authService: AuthService,
  ) {}

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
        let errorMessage = 'Failed to login. Please try again later.';

        if (error.status === 401) {
          errorMessage = 'Invalid Login Data. Please try again.';
        } else if (error.status === 404) {
          errorMessage = 'User not found.';
        } else if (error.status === 500) {
          errorMessage = 'Internal server error. Please try again later.';
        }
        console.log("Error:",errorMessage)

        alert(errorMessage);
        console.error('Login error:', error);
      }
    );
  }
}
