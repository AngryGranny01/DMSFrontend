import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { UserService } from './user.service';
import { LogDataService } from './api/log-data.service';
import { UserDataService } from './api/user-data.service';
import { EncryptionService } from './encryption.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isAuthenticated = false;

  constructor(
    private readonly router: Router,
    private userService: UserService,
    private logDataService: LogDataService,
    private userDataService: UserDataService,
    private encryptionService: EncryptionService
  ) {}

  /**
   * Attempts to login a user with the provided email and password.
   * If successful, sets the current user, updates authentication status,
   * navigates to the dashboard, and logs the login action.
   * If unsuccessful, displays an error message.
   * @param email The email of the user attempting to login.
   * @param passwordPlain The plain text password of the user.
   */
  loginUser(email: string, passwordPlain: string) {
    let salt  = this.encryptionService.generateSalt()
    console.log("Salt: ", salt)
    console.log(this.encryptionService.getPBKDF2Key(passwordPlain,salt))
    if (passwordPlain !== '') {
      this.userDataService.checkPassword(passwordPlain, email).subscribe(
        (passwordData) => {
          this.userDataService
            .getUser(
              passwordData.userID
            )
            .subscribe(
              (userData) => {
                if (userData) {
                  // User login successful
                  this.userService.currentUser = userData;
                  this.userService.currentUsername.next(userData.userName);
                  console.log(this.userService.currentUser);
                  this.isAuthenticated = true;
                  this.router.navigate(['/dashboard']);
                  this.logDataService.addLoginLog();
                } else {
                  // User login failed
                  alert('Username or Password is incorrect');
                }
              },
              (error) => {
                // Handle login data retrieval error
                console.error('Error retrieving user data:', error);
                alert('Failed to retrieve user data. Please try again later.');
              }
            );
        },
        (error) => {
          // Handle password check error
          console.error('Error checking password:', error);
          alert('Failed to login. Please try again later.');
        }
      );
    } else {
      alert('Password field cannot be empty');
    }
  }

  /**
   * Checks if the user is currently logged in.
   * @returns True if the user is authenticated, false otherwise.
   */
  isLoggedIn(): boolean {
    return this.isAuthenticated;
  }

  /**
   * Logs the user out by navigating to the login page,
   * updating authentication status, and logging the logout action.
   */
  logout(): void {
    this.router.navigate(['/login']);
    this.isAuthenticated = false;

    // Log logout action
    this.logDataService.addLogoutLog();
  }
}
