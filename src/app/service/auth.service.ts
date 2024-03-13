import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from './user.service';
import { Log } from '../models/logInterface';
import { LogDataService } from './api/log-data.service';
import { ActivityName } from '../models/activityName';
import { UserDataService } from './api/user-data.service';
import { TranslateService } from '@ngx-translate/core';

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
    private translate: TranslateService
  ) {}

  loginUsers(email: string, password: string) {
    this.userDataService.checkLoginData(password, email).subscribe(
      (userData) => {
        if (userData) {
          // User login successful 654321
          this.userService.currentUser = userData;
          this.isAuthenticated = true;

          // Fetch translations for 'en'
          //TODO: Translation doesnt work!!!!
          this.translate.get('en').subscribe((translations: any) => {
            console.log(translations);
            // Create and initialize the log object with translated description
            console.log(translations.LOGIN);
            const log: Log = {
              logId: 0,
              userId: userData.userID, // Assuming the user data contains userId
              activityName: ActivityName.LOGIN,
              //TODO: Description LOGIN Translation
              description: "LOGIN", // Use translated description
              firstName: '',
              lastName: '',
              dateTime: userData.lastLogin,
              // Assign other properties as needed
            };

            // Call createUserLog method with the log object
            this.logDataService.createUserLog(log).subscribe(
              () => {
                // Log creation successful, navigate to dashboard
                this.router.navigate(['/dashboard']);
              },
              (error: any) => {
                // Handle log creation error
                console.error('Error creating log:', error);
                // You can display an error message or perform other error handling actions here
              }
            );
          });
        } else {
          // User login failed
          alert('Username or Password is incorrect');
        }
      },
      (error) => {
        // Handle login data retrieval error
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
    const log: Log = {
      logId: 0,
      userId: this.userService.currentUser.userID, // Assuming the user data contains userId
      activityName: ActivityName.LOGOUT,
      //TODO: Description LOGOUT Translation
      description: "LOGOUT", // Use translated description
      firstName: '',
      lastName: '',
      dateTime: this.userService.currentUser.lastLogin,
      // Assign other properties as needed
    };
    this.logDataService.createUserLog(log)
  }
}
