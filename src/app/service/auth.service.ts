import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';
import { UserService } from './user.service';
import { LogDataService } from './api/log-data.service';
import { ApiConfigService } from './api/api-config.service';
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
    private http: HttpClient,
    private apiConfig: ApiConfigService,
    private encryptionService: EncryptionService
  ) {}

 /**
   * Attempts to login a user with the provided email and password.
   * If successful, sets the current user, updates authentication status,
   * navigates to the dashboard, and logs the login action.
   * If unsuccessful, displays an error message.
   * @param email The email of the user attempting to login.
   * @param passwordPlain The plain text password of the user.
   * @returns Observable of the login response
   */
 loginUser(email: string, passwordPlain: string): Observable<any> {
  if (passwordPlain.trim() === '') {
    alert('Password field cannot be empty');
    return of(null);
  }

  const getSalt = (): Observable<string> => {
    return this.http.get<string>(`${this.apiConfig.baseURL}/users/findSalt`, {
      params: { email: email },
      responseType: 'text' as 'json' // Ensures responseType is correct
    });
  };

  return getSalt().pipe(
    switchMap((salt: string) => {
      const hashedPassword = this.encryptionService.getPBKDF2Key(passwordPlain, salt);
      const data = {
        email: email,
        hashedPassword: hashedPassword,
      };
      return this.http.post(`${this.apiConfig.baseURL}/login`, data);
    }),
    map((response: any) => {
      this.isAuthenticated = true;
      this.userService.currentUser = response.user;
      this.setToken(response.token); // Store the token
      this.userService.currentUsername.next(response.user.userName);
      this.router.navigate(['/dashboard']);
      this.logDataService.addLoginLog();
      return response;
    }),
    catchError((error) => {
      console.error('Login error:', error);
      alert('Login failed, please try again.');
      return of(null);
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
    this.removeToken(); // Remove the token
  }

  setToken(token: string) {
    localStorage.setItem('authToken', token);
  }

  getToken(): string {
    return localStorage.getItem('authToken') || '';
  }

  removeToken() {
    localStorage.removeItem('authToken');
  }

  setAuthenticated(authenticated: boolean){
    this.isAuthenticated = authenticated
  }
}
