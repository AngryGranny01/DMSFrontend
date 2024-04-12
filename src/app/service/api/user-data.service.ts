import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { User } from '../../models/userInterface';
import { ApiConfigService } from './api-config.service';
import { Role } from '../../models/role';
import { EncryptionService } from '../encryption.service';
import { UserService } from '../user.service';
import { STANDARD_PUBLIC_KEY } from '../../constants/env';

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
        const hashedPassword = this.encryptionService.getPBKDF2Key(
          passwordPlain,
          response.salt
        );
        const keys =
          this.encryptionService.generateRSAKeyPairFromHash(hashedPassword);
        return this.getPassword(userEmail).pipe(
          map((response: any) => {
            let decryptedPassword = this.encryptionService.decryptRSA(
              response.passwordHash,
              keys.privateKey
            );
            if (decryptedPassword === hashedPassword) {
              return {
                passwordHash: decryptedPassword,
                userID: response.userID,
                privateKey: keys.privateKey,
                publicKey: keys.publicKey,
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
   * @param privateKey The private key for decryption.
   * @param publicKey The public key for encryption.
   * @returns An Observable containing the user details.
   */
  getUser(
    userID: string,
    privateKey: string,
    publicKey: string
  ): Observable<User> {
    return this.http.get<any>(`${this.apiConfig.baseURL}/user/${userID}`).pipe(
      map((userData) => {
        if (!userData) {
          throw new Error('User data not found');
        }
        return this.encryptionService.decryptUserData(
          userData,
          privateKey,
          publicKey
        );
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
    const sender = this.userService.currentUser;
    return this.http
      .get<any[]>(`${this.apiConfig.baseURL}/users/${sender.userID}`)
      .pipe(
        map((response: any[]) =>
          response.map((user) =>
            this.encryptionService.decryptUserData(
              user,
              sender.privateKey,
              sender.publicKey
            )
          )
        )
      );
  }

  /**
   * Retrieves the last logins for each user.
   * @param senderID The ID of the sender.
   * @param privateKey The private key for decryption.
   * @returns An Observable containing the last logins data.
   */
  getLastLogins(
    senderID: number,
    privateKey: string
  ): Observable<{ [userID: string]: Date }> {
    return this.http
      .get<any[]>(`${this.apiConfig.baseURL}/user-logs/lastLogins/${senderID}`)
      .pipe(
        map((response: any[]) => {
          const lastLogins: { [userID: string]: Date } = {};
          response.forEach((entry) => {
            let decryptedDate = new Date(
              this.encryptionService.decryptRSA(entry.date, privateKey)
            );
            let decryptedUserID = this.encryptionService.decryptRSA(
              entry.userID,
              privateKey
            );
            lastLogins[decryptedUserID] = decryptedDate;
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
    const encryptedEmail = encodeURIComponent(
      this.encryptionService.encryptRSA(userEmail, STANDARD_PUBLIC_KEY)
    );
    return this.http
      .get(
        `${this.apiConfig.baseURL}/users/checkEmailExist?email=${encryptedEmail}`
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
    const encryptedUsername = encodeURIComponent(
      this.encryptionService.encryptRSA(userName, STANDARD_PUBLIC_KEY)
    );
    return this.http
      .get(
        `${this.apiConfig.baseURL}/users/checkUsernameExist?username=${encryptedUsername}`
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

    const encryptedUser = this.encryptionService.encryptUserData(
      createUser,
      STANDARD_PUBLIC_KEY
    );
    return this.http.post(`${this.apiConfig.baseURL}/users`, encryptedUser);
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
      user.privateKey,
      salt
    );
    let keys = this.encryptionService.generateRSAKeyPairFromHash(passwordHash);
    if (user.userID === this.userService.currentUser.userID) {
      this.userService.currentUser.publicKey = keys.publicKey;
      this.userService.currentUser.privateKey = keys.privateKey;
    }

    const updateUser = {
      userID: user.userID,
      userName: user.userName,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      passwordHash: passwordHash,
      salt: salt,
      role: user.role,
      orgEinheit: user.orgEinheit,
      publicKey: keys.publicKey,
    };

    const encryptedUser = this.encryptionService.encryptUserData(
      updateUser,
      STANDARD_PUBLIC_KEY
    );
    encryptedUser.publicKey = keys.publicKey;
    return this.http.put(`${this.apiConfig.baseURL}/users`, encryptedUser);
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
    let keys = this.encryptionService.generateRSAKeyPairFromHash(passwordHash);

    const data = {
      token: token,
      passwordHash: this.encryptionService.encryptRSA(
        passwordHash,
        STANDARD_PUBLIC_KEY
      ),
      salt: salt,
      publicKey: keys.publicKey,
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
      response.orgEinheit,
      response.publicKey
    );
  }
}
