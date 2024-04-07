import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { User } from '../../models/userInterface';
import { ApiConfigService } from './api-config.service';
import { Role } from '../../models/role';
import { NiceDate } from '../../models/niceDateInterface';
import { Observable, generate, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { EncryptionService } from '../encryption.service';
import { UserService } from '../user.service';
import { STANDARD_PRIVATE_KEY, STANDARD_PUBLIC_KEY } from '../../constants/env';
import { decrypt } from 'dotenv';
// Retrieve private and public keys from environment variables

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
              console.log("Im Called")
              const result = {
                passwordHash: decryptedPassword,
                userID: response.userID,
                privateKey: keys.privateKey,
                publicKey: keys.publicKey,
              }
              console.log(result)
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

  getUser(userID: string, privateKey: string, publicKey: string): Observable<User> {
    return this.http.get<any>(`${this.apiConfig.baseURL}/user/${userID}`).pipe(
      map((userData) => {
        console.log(userData);
        if (!userData) {
          throw new Error('User data not found');
        }
        return this.encryptionService.decryptUserData(userData, privateKey, publicKey);
      }),
      catchError((error) => {
        console.error('Failed to fetch user data:', error);
        throw new Error('Failed to fetch user data');
      })
    );
  }

  getPassword(userEmail: string): Observable<any> {
    return this.http.get(`${this.apiConfig.baseURL}/users/login?email=${userEmail}`).pipe(
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

  //return a Observable map with key userID and value Date
  getLastLogins(): Observable<{ [userID: string]: Date }> {
    return this.http
      .get<any[]>(`${this.apiConfig.baseURL}/user-logs/lastLogins`)
      .pipe(
        map((response: any[]) => {
          const lastLogins: { [userID: string]: Date } = {};
          response.forEach((entry) => {
            lastLogins[entry.userID] = new Date(entry.date);
          });
          return lastLogins;
        })
      );
  }

  getSaltByEmail(email: string): Observable<string> {
    return this.http
      .get(`${this.apiConfig.baseURL}/users/findSalt?email=${email}`)
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

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

  //check IF Password and Email is right

  //-------------------------------------------- Post-Requests --------------------------------------------------------------//
  createUser(user: User) {
    const createUser = {
      userName: user.userName,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      orgEinheit: user.orgEinheit,
    };

    // Encrypt the createUser object using the encryption service
    const encryptedUser = this.encryptionService.encryptUserData(
      createUser,
      STANDARD_PUBLIC_KEY
    );
    return this.http.post(`${this.apiConfig.baseURL}/users`, encryptedUser);
  }

  //-------------------------------------------- Put-Requests --------------------------------------------------------------//
  updateUser(user: User) {
    let salt = this.encryptionService.generateSalt();
    let passwordHash = this.encryptionService.getPBKDF2Key(
      user.privateKey,
      salt
    );
    let keys = this.encryptionService.generateRSAKeyPairFromHash(passwordHash);
    if(user.userID === this.userService.currentUser.userID){
      this.userService.currentUser.publicKey = keys.publicKey
      this.userService.currentUser.privateKey = keys.privateKey
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
    console.log("Keys: ")
    console.log(keys.privateKey)
    console.log(keys.publicKey)
    // Encrypt the createUser object using the encryption service
    const encryptedUser = this.encryptionService.encryptUserData(
      updateUser,
      STANDARD_PUBLIC_KEY
    );
    encryptedUser.publicKey = keys.publicKey
    return this.http.put(`${this.apiConfig.baseURL}/users`, encryptedUser);
  }

  //-------------------------------------------- Delete-Requests --------------------------------------------------------------//
  deleteUser(userID: number) {
    return this.http.delete(`${this.apiConfig.baseURL}/users/${userID}`);
  }

  verifyToken(token: string, passwordPlain: string): Observable<string> {
    let salt = this.encryptionService.generateSalt();
    let passwordHash = this.encryptionService.getPBKDF2Key(passwordPlain, salt);
    let keys = this.encryptionService.generateRSAKeyPairFromHash(passwordHash)

    const data = {
      token: token,
      passwordHash: this.encryptionService.encryptRSA(passwordHash,STANDARD_PUBLIC_KEY),
      salt: salt,
      publicKey: keys.publicKey
    };
    console.log("Im Called")
    return this.http.put<string>(`${this.apiConfig.baseURL}/verifyToken`, data);
  }

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
