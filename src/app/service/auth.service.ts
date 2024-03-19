import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from './user.service';
import { Log } from '../models/logInterface';
import { LogDataService } from './api/log-data.service';
import { ActivityName } from '../models/activityName';
import { UserDataService } from './api/user-data.service';
import { TranslateService } from '@ngx-translate/core';
import { LogDescriptionValues } from '../models/logDescriptionValues';
import { LogService } from './log.service';
import CryptoJS from 'crypto-js';
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
    private encryptionService: EncryptionService,
    private logService: LogService
  ) {}

  loginUsers(email: string, passwordPlain: string) {
    this.userDataService.checkLoginData(passwordPlain, email).subscribe(
      (userData) => {
        if (userData) {
          // User login successful
          this.userService.currentUser = userData;
          this.userService.currentUser.password = passwordPlain;
          this.userService.currentUsername.next(userData.username);

          this.isAuthenticated = true;

          // Log Entry
          this.logDataService.addLoginLog();

          this.router.navigate(['/dashboard']);
        } else {
          // User login failed
          alert('Username or Password is incorrect');
        }
      },
      (error) => {
        // Handle login data retrieval error
        alert('Username or Password is incorrect');
        console.error('Error logging in:', error);
        // You can display an error message or perform other error handling actions here
      }
    );
  }


  isLoggedIn(): boolean {
    return this.isAuthenticated;
  }

  logout(): void {
    this.router.navigate(['/login']);
    this.isAuthenticated = false;

    //Log Entry
    this.logDataService.addLogoutLog();
  }
}
