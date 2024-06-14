import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { UserService } from './user.service';
import { LogDataService } from './api/log-data.service';
import { ApiConfigService } from './api/api-config.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isAuthenticated = false;

  constructor(
    private readonly router: Router,
    private userService: UserService,
    private logDataService: LogDataService,
    private http: HttpClient,
    private apiConfig: ApiConfigService,
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
    if (passwordPlain.trim() === '') {
      alert('Password field cannot be empty');
      return;
    }
    const data = {
      email: email,
      passwordPlain: passwordPlain,
    }
    return this.http.post(`${this.apiConfig.baseURL}/login`, data)
      .pipe(
        map((response: any) => {
          this.isAuthenticated = true;
          this.userService.currentUser = response.user;
          console.log(this.userService.currentUser)
          this.userService.currentUsername.next(response.user.userName);
          this.router.navigate(['/dashboard']);
          this.logDataService.addLoginLog();
        }),
        catchError((error) => {
          console.error('Login error:', error);
          this.logDataService.addErrorUserLog(`Login error`);
          throw new Error(error);
        })
      );
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
    this.logDataService.addLogoutLog();
  }
}
