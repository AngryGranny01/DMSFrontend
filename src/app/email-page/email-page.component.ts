import { Component, OnInit } from '@angular/core';
import { UserService } from '../service/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserDataService } from '../service/api/user-data.service';

@Component({
  selector: 'app-email-page',
  templateUrl: './email-page.component.html',
  styleUrls: ['./email-page.component.css'],
})
export class EmailPageComponent implements OnInit {
  password: string = ''; // Holds the user's new password
  confirmPassword: string = ''; // Holds the confirmation of the user's new password
  token: string = ''; // Holds the token received from the query parameters
  errorMessage: string = ''; // Holds error messages to be displayed

  constructor(
    private userService: UserService,
    private userDataService: UserDataService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Retrieves the token from the query parameters
    this.route.queryParams.subscribe((params) => {
      this.token = params['token'];
    });
  }

  // Sets the user's password
  setPassword() {
    // Checks if the password meets the strength requirements
    if (!this.userService.isPasswordStrong(this.password)) {
      alert(
        'Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, and one number'
      );
      return;
    }

    // Checks if the passwords match
    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    // Calls the UserDataService to verify the token and update the password
    this.userDataService.verifyToken(this.token, this.password).subscribe(
      () => {
        // Success response handling
        alert('Password updated successfully!'); // You may replace this with your preferred success message
        this.router.navigate(['/login']);
      },
      (error) => {
        // Error response handling
        if (error.status === 400) {
          this.errorMessage = 'Invalid or expired token';
        } else if (error.status === 404) {
          this.errorMessage = 'User not found';
        } else {
          this.errorMessage = error;
        }
        alert(this.errorMessage);
      }
    );
  }
}
