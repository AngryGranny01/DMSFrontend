import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { User } from '../../models/userInterface';
import { ApiConfigService } from './api-config.service';
import { Role } from '../../models/role';
import { EncryptionService } from '../encryption.service';
import { UserService } from '../user.service';

@Injectable({
  providedIn: 'root',
})
export class UserDataService {
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
    private encryptionService: EncryptionService,
    private userService: UserService
  ) {}

  //-------------------------------------------- Login --------------------------------------------------------------//

  /**
   * Checks the validity of the password for the given user email.
   * @param passwordPlain The plain text password.
   * @param userEmail The email of the user.
   * @returns An Observable containing the password data if successful.
   */
  checkPassword(passwordPlain: string, userEmail: string): Observable<any> {
    return this.getSaltByEmail(userEmail).pipe(
      switchMap((response: any) => {
        console.log(response.salt)
        const hashedPassword = this.encryptionService.getPBKDF2Key(
          passwordPlain,
          response.salt
        );

        return this.getPassword(userEmail).pipe(
          map((response: any) => {

            if (response.passwordHash === hashedPassword) {
              return {
                passwordHash: response.passwordHash,
                userID: response.userID,
              };
            } else {
              throw new Error('Password mismatch');
            }
          }),
          catchError((error) => {
            console.error('Failed to retrieve password:', error);
            throw new Error('Failed to retrieve password');
          })
        );
      }),
      catchError((error) => {
        console.error('Failed to retrieve salt:', error);
        throw new Error('Failed to retrieve salt');
      })
    );
  }

  /**
   * Retrieves user details by user ID.
   * @param userID The ID of the user.
   * @returns An Observable containing the user details.
   */
  getUser(
    userID: string
  ): Observable<User> {
    return this.http.get<any>(`${this.apiConfig.baseURL}/user/${userID}`).pipe(
      map((userData) => {
        if (!userData) {
          throw new Error('User data not found');
        }
        return userData
      }),
      catchError((error) => {
        console.error('Failed to fetch user data:', error);
        throw new Error('Failed to fetch user data');
      })
    );
  }

  /**
   * Retrieves the password data by user email.
   * @param userEmail The email of the user.
   * @returns An Observable containing the password data.
   */
  getPassword(userEmail: string): Observable<any> {
    return this.http
      .get(`${this.apiConfig.baseURL}/users/login?email=${userEmail}`)
      .pipe(
        map((response: any) => {
          return response;
        }),
        catchError((error) => {
          console.error('Failed to retrieve password:', error);
          throw new Error('Failed to retrieve password');
        })
      );
  }

  //-------------------------------------------- Get-Requests --------------------------------------------------------------//

  /**
   * Retrieves all users.
   * @returns An Observable containing the list of users.
   */
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiConfig.baseURL}/users`).pipe(
      map((users: User[]) => {
        // Process each user within the map operator
        return users.map(user => this.extractUser(user));
      })
    );
  }

  /**
   * Retrieves the last logins for each user.
   * @param senderID The ID of the sender.
   * @returns An Observable containing the last logins data.
   */
  getLastLogins(
    senderID: number
  ): Observable<{ [userID: string]: Date }> {
    return this.http
      .get<any[]>(`${this.apiConfig.baseURL}/user-logs/lastLogins/${senderID}`)
      .pipe(
        map((response: any[]) => {
          const lastLogins: { [userID: string]: Date } = {};
          response.forEach((entry) => {
            lastLogins[entry.userID] = new Date(entry.date)
          });
          return lastLogins;
        })
      );
  }

  /**
   * Retrieves the salt by user email.
   * @param email The email of the user.
   * @returns An Observable containing the salt.
   */
  getSaltByEmail(email: string): Observable<string> {
    return this.http
      .get(`${this.apiConfig.baseURL}/users/findSalt?email=${email}`)
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  /**
   * Checks if the given user email exists.
   * @param userEmail The email of the user.
   * @returns An Observable indicating whether the user email exists.
   */
  checkIfUserEmailExists(userEmail: string) {
    return this.http
      .get(
        `${this.apiConfig.baseURL}/users/checkEmailExist?email=${userEmail}`
      )
      .pipe(
        map((response: any) => {
          return response.exist;
        })
      );
  }

  /**
   * Checks if the given username exists.
   * @param userName The username to check.
   * @returns An Observable indicating whether the username exists.
   */
  checkIfUserNameExists(userName: string) {
    return this.http
      .get(
        `${this.apiConfig.baseURL}/users/checkUsernameExist?username=${userName}`
      )
      .pipe(
        map((response: any) => {
          return response.exist;
        })
      );
  }

  //-------------------------------------------- Post-Requests --------------------------------------------------------------//

  /**
   * Creates a new user.
   * @param user The user data to be created.
   * @returns An Observable representing the HTTP response.
   */
  createUser(user: User) {
    const createUser = {
      userName: user.userName,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      orgEinheit: user.orgEinheit,
    };
    return this.http.post(`${this.apiConfig.baseURL}/users`, createUser);
  }

  //-------------------------------------------- Put-Requests --------------------------------------------------------------//

  /**
   * Updates an existing user.
   * @param user The user data to be updated.
   * @returns An Observable representing the HTTP response.
   */
  updateUser(user: User) {
    let salt = this.encryptionService.generateSalt();
    let passwordHash = this.encryptionService.getPBKDF2Key(
      user.passwordHash,
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

    if(user.passwordHash === ""){
      updateUser.passwordHash = ""
      updateUser.salt = ""
    }

    return this.http.put(`${this.apiConfig.baseURL}/users`, updateUser);
  }

  //-------------------------------------------- Delete-Requests --------------------------------------------------------------//

  /**
   * Deletes a user by user ID.
   * @param userID The ID of the user to be deleted.
   * @returns An Observable representing the HTTP response.
   */
  deleteUser(userID: number) {
    return this.http.delete(`${this.apiConfig.baseURL}/users/${userID}`);
  }

  /**
   * Verifies a token.
   * @param token The token to be verified.
   * @param passwordPlain The plain text password.
   * @returns An Observable containing the verification status.
   */
  verifyToken(token: string, passwordPlain: string): Observable<string> {
    let salt = this.encryptionService.generateSalt();
    let passwordHash = this.encryptionService.getPBKDF2Key(passwordPlain, salt);

    const data = {
      token: token,
      passwordHash: passwordHash,
      salt: salt
    };
    return this.http.put<string>(`${this.apiConfig.baseURL}/verifyToken`, data);
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
      response.passwordHash,
      role,
      response.email,
      response.orgEinheit
    );
  }
}
