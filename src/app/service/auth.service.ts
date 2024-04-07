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

  //TODO: update login one for password check and then get userData!
  loginUser(email: string, passwordPlain: string) {
    this.userDataService.checkPassword(passwordPlain, email).subscribe(
      (passwordData) => {
        this.userDataService
          .getUser(
            passwordData.userID,
            passwordData.privateKey,
            passwordData.publicKey
          )
          .subscribe(
            (userData) => {
              if (userData) {
                // User login successful
                this.userService.currentUser = userData;
                this.userService.currentUsername.next(userData.userName);
                console.log(this.userService.currentUser)
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
