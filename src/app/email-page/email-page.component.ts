import { Component } from '@angular/core';
import { UserService } from '../service/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserDataService } from '../service/api/user-data.service';
import { EncryptionService } from '../service/encryption.service';
import { catchError, throwError } from 'rxjs';

@Component({
  selector: 'app-email-page',
  templateUrl: './email-page.component.html',
  styleUrls: ['./email-page.component.css'],
})
export class EmailPageComponent {
  password: string = '';
  confirmPassword: string = '';
  token: string = '';
  errorMessage: string = '';

  constructor(
    private userService: UserService,
    private userDataService: UserDataService,
    private encryptionService: EncryptionService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.token = params['token'];
    });
  }

  setPassword() {
    console.log(this.password);
    console.log(this.confirmPassword);

    if (!this.userService.isPasswordStrong(this.password)) {
      alert(
        'Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, and one number'
      );
      return;
    }

    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    let salt = this.encryptionService.generateSalt();
    let passwordHash = this.encryptionService.encryptPBKDF2(
      this.password,
      salt
    );

    this.userDataService.verifyToken(this.token, passwordHash, salt).subscribe(
      (response) => {
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
          this.errorMessage = 'Error updating password';
        }
        // You may choose to display the error message or handle it differently
        alert(this.errorMessage);
      }
    );
  }
}
