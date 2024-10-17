import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { User } from '../../models/userInterface';
import { ApiConfigService } from './api-config.service';
import { Role } from '../../models/roleEnum';
import { EncryptionService } from '../encryption.service';
import { LogDataService } from './log-data.service';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root',
})
export class UserDataService {
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
    private encryptionService: EncryptionService,
    private logDataService: LogDataService,
    private authService: AuthService
  ) {}

  //-------------------------------------------- Get-Requests --------------------------------------------------------------//

  /**
   * Retrieves all users.
   * @returns An Observable containing the list of users.
   */
  getAllUsers(): Observable<User[]> {
    return this.http
      .get<User[]>(`${this.apiConfig.baseURL}/users`, {
        headers: this.authService.getAuthHeaders(),
      })
      .pipe(
        catchError((error) => {
          console.error('Failed to fetch users:', error);
          throw new Error('Failed to fetch users');
        })
      );
  }

  /**
   * Retrieves the last logins for each user.
   * @param senderID The ID of the sender.
   * @returns An Observable containing the last logins data.
   */
  getLastLogins(): Observable<{ [userID: string]: Date }> {
    return this.http
      .get<any[]>(`${this.apiConfig.baseURL}/logs/lastLogins`, {
        headers: this.authService.getAuthHeaders(),
      })
      .pipe(
        map((response: any[]) => {
          const lastLogins: { [userID: string]: Date } = {};
          response.forEach((entry) => {
            lastLogins[entry.userID] = new Date(entry.date);
          });
          return lastLogins;
        }),
        catchError((error) => {
          console.error('Failed to fetch last logins:', error);
          this.logDataService.addErrorUserLog(error.message);
          throw new Error('Failed to fetch last logins');
        })
      );
  }

  //-------------------------------------------- Post-Requests --------------------------------------------------------------//

  /**
   * Creates a new user.
   * @param user The user data to be created.
   * @returns An Observable representing the HTTP response.
   */
  createUser(user: User): Observable<User> {
    const createUser = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      orgUnit: user.orgUnit,
      isDeactivated: true,
    };
    return this.http
      .post<User>(`${this.apiConfig.baseURL}/users`, createUser, {
        headers: this.authService.getAuthHeaders(),
      })
      .pipe(
        catchError((error) => {
          this.logDataService.addErrorUserCreateLog(error.message);
          console.error('Failed to create user:', error);
          throw new Error('Failed to create user');
        })
      );
  }

  //-------------------------------------------- Put-Requests --------------------------------------------------------------//

  /**
   * Updates an existing user's information.
   * @param user The user data to be updated.
   * @returns An Observable representing the HTTP response.
   */
  updateUser(user: User): Observable<any> {
    const updateUser = {
      accountID: user.userID,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      orgUnit: user.orgUnit,
      isDeactivated: user.isDeactivated,
    };

    console.log(updateUser);

    return this.http
      .put<User>(`${this.apiConfig.baseURL}/users`, updateUser, {
        headers: this.authService.getAuthHeaders(),
      })
      .pipe(
        catchError((error) => {
          this.logDataService.addErrorUserLog(error.message);
          console.error('Failed to update user:', error);
          return throwError('Failed to update user');
        })
      );
  }

  /**
   * Updates an existing user's password.
   * @param userID The ID of the account to update the password for.
   * @param passwordPlain The new plain text password.
   * @returns An Observable representing the HTTP response.
   */
  updatePassword(userID: number, passwordPlain: string): Observable<any> {
    const salt = this.encryptionService.generateSalt();
    const passwordHash = this.encryptionService.getPBKDF2Key(
      passwordPlain,
      salt
    );

    const updatedPassword = {
      accountID: userID,
      passwordHash: passwordHash,
      salt: salt,
    };

    return this.http
      .put(`${this.apiConfig.baseURL}/users/password`, updatedPassword, {
        headers: this.authService.getAuthHeaders(),
      })
      .pipe(
        catchError((error) => {
          console.error('Failed to update password:', error);
          this.logDataService.addErrorPasswordLog(userID, error.message);
          return throwError('Failed to update password');
        })
      );
  }

  //-------------------------------------------- Delete-Requests --------------------------------------------------------------//

  /**
   * Deactivates a user by user ID.
   * @param userID The ID of the user to be deleted.
   * @returns An Observable representing the HTTP response.
   */
  deactivateUser(userID: number): Observable<void> {
    return this.http
      .put<void>(`${this.apiConfig.baseURL}/users/deactivate/${userID}`, {
        headers: this.authService.getAuthHeaders(),
      })
      .pipe(
        catchError((error) => {
          this.logDataService.addErrorUserLog(error.message);
          console.error('Failed to deactivate user:', error);
          throw new Error('Failed to deactivate user');
        })
      );
  }

  /**
   * Verifies a token.
   * @param token The token to be verified.
   * @param passwordPlain The plain text password.
   * @returns An Observable containing the verification status.
   */
  verifyEmailToken(token: string, passwordPlain: string): Observable<string> {
    const salt = this.encryptionService.generateSalt();
    const passwordHash = this.encryptionService.getPBKDF2Key(
      passwordPlain,
      salt
    );
    const data = { token, passwordHash, salt };
    return this.http
      .put<string>(`${this.apiConfig.baseURL}/verifyToken`, data)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          let errorMessage = 'Failed to verify token';
          if (error.status === 400) {
            errorMessage = 'Invalid or expired token';
          } else if (error.status === 401) {
            errorMessage = 'Token expired';
          } else if (error.status === 404) {
            errorMessage = 'User not found';
          } else {
            errorMessage = 'An unknown error occurred';
          }
          console.error(errorMessage);
          return throwError(errorMessage);
        })
      );
  }

  //-------------------------------------------- Helper Functions --------------------------------------------------------------//

  /**
   * Extracts user details from the response.
   * @param response The response containing user data.
   * @returns The extracted user details.
   */
  extractUser(response: any) {
    const role =
      response.role === Role.ADMIN
        ? Role.ADMIN
        : response.role === Role.PROJECT_MANAGER
        ? Role.PROJECT_MANAGER
        : Role.USER;

    return new User(
      response.userID,
      response.firstName,
      response.lastName,
      role,
      response.email,
      response.orgUnit,
      response.isDeactivated
    );
  }
}
