import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { User } from '../../models/userInterface';
import { ApiConfigService } from './api-config.service';
import { Role } from '../../models/role';
import { EncryptionService } from '../encryption.service';
import { LogDataService } from './log-data.service';

@Injectable({
  providedIn: 'root',
})
export class UserDataService {
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
    private encryptionService: EncryptionService,
    private logDataService: LogDataService
  ) {}


  //-------------------------------------------- Get-Requests --------------------------------------------------------------//

  /**
   * Retrieves all users.
   * @returns An Observable containing the list of users.
   */
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiConfig.baseURL}/users`)
      .pipe(
        catchError((error) => {
          console.error('Failed to fetch users:', error);
          this.logDataService.addErrorUserLog(`Failed to fetch all users`);
          throw new Error(('Failed to fetch users'));
        })
      );
  }

  /**
   * Retrieves the last logins for each user.
   * @param senderID The ID of the sender.
   * @returns An Observable containing the last logins data.
   */
  getLastLogins(senderID: number): Observable<{ [userID: string]: Date }> {
    return this.http.get<any[]>(`${this.apiConfig.baseURL}/logs/lastLogins/${senderID}`)
      .pipe(
        map((response: any[]) => {
          const lastLogins: { [userID: string]: Date } = {};
          response.forEach(entry => {
            lastLogins[entry.userID] = new Date(entry.date);
          });
          return lastLogins;
        }),
        catchError((error) => {
          console.error('Failed to fetch last logins:', error);
          this.logDataService.addErrorUserLog(`Failed to fetch last logins of users`);
          throw new Error('Failed to fetch last logins');
        })
      );
  }


  /**
   * Checks if the given user email exists.
   * @param userEmail The email of the user.
   * @returns An Observable indicating whether the user email exists.
   */
  checkIfUserEmailExists(userEmail: string): Observable<boolean> {
    return this.http.get<any>(`${this.apiConfig.baseURL}/users/checkEmailExist?email=${userEmail}`)
      .pipe(
        map(response => response.exist),
        catchError((error) => {
          console.error('Failed to check email existence:', error);
          throw new Error('Failed to check email existence');
        })
      );
  }

  /**
   * Checks if the given username exists.
   * @param userName The username to check.
   * @returns An Observable indicating whether the username exists.
   */
  checkIfUserNameExists(userName: string): Observable<boolean> {
    return this.http.get<any>(`${this.apiConfig.baseURL}/users/checkUsernameExist?username=${userName}`)
      .pipe(
        map(response => response.exist),
        catchError((error) => {
          console.error('Failed to check username existence:', error);
          throw new Error('Failed to check username existence');
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
      userName: user.userName,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      orgEinheit: user.orgEinheit,
    };
    return this.http.post<User>(`${this.apiConfig.baseURL}/users`, createUser)
      .pipe(
        catchError((error) => {
          console.error('Failed to create user:', error);
          throw new Error('Failed to create user');
        })
      );
  }

  //-------------------------------------------- Put-Requests --------------------------------------------------------------//

  /**
   * Updates an existing user.
   * @param user The user data to be updated.
   * @returns An Observable representing the HTTP response.
   */
  updateUser(user: User, passwordPlain: string) {
    let salt = this.encryptionService.generateSalt();
    let passwordHash = this.encryptionService.getPBKDF2Key(
      passwordPlain,
      salt
    );

    const updateUser = {
      userID: user.userID,
      userName: user.userName,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      passwordHash: passwordHash,
      salt: salt,
      role: user.role,
      orgEinheit: user.orgEinheit
    };

    if(passwordPlain === ""){
      updateUser.passwordHash = ""
      updateUser.salt = ""
    }

    return this.http.put<User>(`${this.apiConfig.baseURL}/users`, updateUser)
    .pipe(
      catchError((error) => {
        console.error('Failed to update user:', error);
        throw new Error('Failed to update user');
      })
    );
  }

  //-------------------------------------------- Delete-Requests --------------------------------------------------------------//

  /**
   * Deletes a user by user ID.
   * @param userID The ID of the user to be deleted.
   * @returns An Observable representing the HTTP response.
   */
  deleteUser(userID: number): Observable<void> {
    return this.http.delete<void>(`${this.apiConfig.baseURL}/users/${userID}`)
      .pipe(
        catchError((error) => {
          console.error('Failed to delete user:', error);
          throw new Error('Failed to delete user');
        })
      );
  }

  /**
   * Verifies a token.
   * @param token The token to be verified.
   * @param passwordPlain The plain text password.
   * @returns An Observable containing the verification status.
   */
  verifyToken(token: string, passwordPlain: string): Observable<string> {
    const salt = this.encryptionService.generateSalt();
    const passwordHash = this.encryptionService.getPBKDF2Key(passwordPlain, salt);
    const data = { token, passwordHash, salt };
    return this.http.put<string>(`${this.apiConfig.baseURL}/verifyToken`, data)
      .pipe(
        catchError((error) => {
          console.error('Failed to verify token:', error);
          throw new Error('Failed to verify token');
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
        : response.role === Role.MANAGER
        ? Role.MANAGER
        : Role.USER;

    return new User(
      response.userID,
      response.userName,
      response.firstName,
      response.lastName,
      response.salt,
      role,
      response.email,
      response.orgEinheit
    );
  }
}
