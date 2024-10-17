import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';
import { UserService } from './user.service';
import { LogDataService } from './api/log-data.service';
import { ApiConfigService } from './api/api-config.service';
import { EncryptionService } from './encryption.service';
import { Role } from '../models/roleEnum';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private readonly router: Router,
    private userService: UserService,
    private logDataService: LogDataService,
    private http: HttpClient,
    private apiConfig: ApiConfigService,
    private encryptionService: EncryptionService
  ) {}

  loginUser(email: string, passwordPlain: string): Observable<any> {
    if (passwordPlain.trim() === '') {
      alert('Password field cannot be empty');
      return of(null);
    }

    const getSalt = (): Observable<string> => {
      return this.http.get<string>(`${this.apiConfig.baseURL}/users/findSalt`, {
        params: { email: email },
        responseType: 'text' as 'json',
      });
    };

    return getSalt().pipe(
      switchMap((salt: string) => {
        const hashedPassword = this.encryptionService.getPBKDF2Key(
          passwordPlain,
          salt
        );
        const data = { email, hashedPassword };
        return this.http.post(`${this.apiConfig.baseURL}/login`, data);
      }),
      map((response: any) => {
        this.userService.currentUser.role = response.user.role as Role;
        this.setToken(response.token);
        this.userService.setCurrentUser(response.user);
        this.userService.setLastLoginTime(Date())
        const fullName = this.userService.concatenateFirstnameLastname(
          response.user.firstName,
          response.user.lastName
        );
        this.userService.currentUserFirstAndLastName$.next(fullName);
        this.router.navigate(['/dashboard']);
        this.logDataService.addLoginLog();
        return response;
      }),
      catchError((error) => {
        console.error('Login error:', error);
        return throwError(error);
      })
    );
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    this.router.navigate(['/login']);
    this.logDataService.addLogoutLog();
    this.userService.clearCurrentUser();
    this.removeToken();
  }

  setToken(token: string) {
    sessionStorage.setItem('authToken', token);
  }

  getToken(): string {
    return sessionStorage.getItem('authToken') || '';
  }

  removeToken() {
    sessionStorage.removeItem('authToken');
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  getUserRoleFromToken(): string {
    const token = this.getToken();
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role;
    }
    return '';
  }
}
