import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { User } from '../../models/userInterface';
import { ApiConfigService } from './api-config.service';
import { Role } from '../../models/role';
import { NiceDate } from '../../models/niceDateInterface';
import { Observable, generate } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { EncryptionService } from '../encryption.service';
import { UserService } from '../user.service';
import { STANDARD_PRIVATE_KEY, STANDARD_PUBLIC_KEY } from '../../constants/env';
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
  checkLoginData(passwordPlain: string, userEmail: string): Observable<User> {
    return this.getSaltByEmail(userEmail).pipe(
      switchMap((response: any) => {
        const hashedPassword = this.encryptionService.getPBKDF2Key(
          passwordPlain,
          response.salt
        );
        let keys = this.encryptionService.generateRSAKeyPairFromHash(hashedPassword);
        return this.http
          .get<any>(
            `${this.apiConfig.baseURL}/users/login?email=${userEmail}&passwordHash=${keys.privateKey}`
          )
          .pipe(
            map((userData) => {
              if (!userData) {
                throw new Error('User data not found');
              }
              let decryptedData = JSON.parse(
                this.encryptionService.decryptRSA(
                  userData,
                  this.userService.currentUser.passwordHash
                )
              );

              let user = new User(
                userData.userID,
                decryptedData.userName,
                decryptedData.firstName,
                decryptedData.lastName,
                hashedPassword,
                decryptedData.role,
                decryptedData.email,
                decryptedData.orgEinheit,
                keys.publicKey
              );
              return user;
            })
          );
      })
    );
  }

  //-------------------------------------------- Get-Requests --------------------------------------------------------------//
  getAllUsers(): Observable<User[]> {
    return this.http
      .get<any[]>(`${this.apiConfig.baseURL}/users`)
      .pipe(
        map((response: any[]) => response.map((user) => this.extractUser(user)))
      );
  }

  getLastLoginUsers(): Observable<any> {
    return this.http
      .get<any[]>(`${this.apiConfig.baseURL}/users/lastLogin`)
      .pipe(
        map((response: any[]) => response.map((user) => this.extractUser(user)))
      );
  }

  getUser(userID: number): Observable<User> {
    return this.http.get(`${this.apiConfig.baseURL}/users/${userID}`).pipe(
      map((response: any) => {
        return this.extractUser(response);
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
    return this.http
      .get(`${this.apiConfig.baseURL}/user/exist/email?email=${userEmail}`)
      .pipe(
        map((response: any) => {
          return response.exist;
        })
      );
  }

  checkIfUserNameExists(userName: string) {
    return this.http
      .get(`${this.apiConfig.baseURL}/user/exist/username?username=${userName}`)
      .pipe(
        map((response: any) => {
          return response.exist;
        })
      );
  }

  //check IF Password and Email is right

  //-------------------------------------------- Post-Requests --------------------------------------------------------------//
  createUser(user: User) {
    let isAdmin = false;
    let isProjectManager = false;

    if (user.role === Role.ADMIN) {
      isAdmin = true;
    }
    if (user.role === Role.MANAGER) {
      isProjectManager = true;
    }

    const createUser = {
      userName: user.userName,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isAdmin: isAdmin.toString(),
      isProjectManager: isProjectManager.toString(),
    };

    // Encrypt the createUser object using the encryption service
    const encryptedUser = this.encryptionService.encryptUserDataRSA(
      createUser,
      STANDARD_PUBLIC_KEY
    );
    return this.http.post(`${this.apiConfig.baseURL}/users`, encryptedUser);
  }

  //-------------------------------------------- Put-Requests --------------------------------------------------------------//
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
    };
    return this.http.put(`${this.apiConfig.baseURL}/users`, updateUser);
  }

  //-------------------------------------------- Delete-Requests --------------------------------------------------------------//
  deleteUser(userID: number) {
    const params = new HttpParams().set('userID', userID.toString());

    return this.http.delete(`${this.apiConfig.baseURL}/users`, { params });
  }

  verifyToken(
    token: string,
    passwordHash: string,
    salt: string
  ): Observable<string> {
    const data = {
      token: token,
      passwordHash: passwordHash,
      salt: salt,
    };

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
