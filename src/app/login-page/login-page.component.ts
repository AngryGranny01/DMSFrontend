import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../service/auth.service';

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
          console.log('Login successful');
        } else {
          alert('Failed to login. Please try again later.');
        }
      },
      (error) => {
        // Handle login error
        let errorMessage = 'Invalid Login Data.';

        alert(errorMessage);
        console.error('Login error:', error);
      }
    );
  }
}
