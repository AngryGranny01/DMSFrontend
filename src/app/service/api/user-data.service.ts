import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { User } from '../../models/userInterface';
import { ApiConfigService } from './api-config.service';
import { Role } from '../../models/role';
import { NiceDate } from '../../models/niceDateInterface';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { EncryptionService } from '../encryption.service';

@Injectable({
  providedIn: 'root',
})
export class UserDataService {
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
    private encryptionService: EncryptionService
  ) {}

  //-------------------------------------------- Login --------------------------------------------------------------//
  checkLoginData(userPassword: string, userEmail: string): Observable<User> {
    return this.getSaltByEmail(userEmail).pipe(
      switchMap((response: any) => {
        console.log(response.salt);
        const hashedPassword = this.encryptionService.encryptPBKDF2(
          userPassword,
          response.salt
        );
        return this.http
          .get<any>(
            `${this.apiConfig.baseURL}/user/login?email=${userEmail}&passwordHash=${hashedPassword}`
          )
          .pipe(
            map((userData) => {
              if (!userData) {
                throw new Error('User data not found');
              }

              let lastLogin = new NiceDate(
                userData.lastLogin.year,
                userData.lastLogin.month,
                userData.lastLogin.day,
                userData.lastLogin.hour,
                userData.lastLogin.minute
              );

              let user = new User(
                userData.userID,
                userData.userName,
                userData.firstName,
                userData.lastName,
                userData.passwordHash,
                userData.role,
                userData.email,
                lastLogin
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

  getUser(userID: number): Observable<User> {
    return this.http.get(`${this.apiConfig.baseURL}/users/${userID}`).pipe(
      map((response: any) => {
        return this.extractUser(response);
      })
    );
  }

  getSaltByEmail(email: string): Observable<string> {
    return this.http
      .get(`${this.apiConfig.baseURL}/user/findSalt?email=${email}`)
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
          console.log(response);
          return response.exist;
        })
      );
  }

  checkIfUserNameExists(userName: string) {
    return this.http
      .get(`${this.apiConfig.baseURL}/user/exist/username?username=${userName}`)
      .pipe(
        map((response: any) => {
          console.log(response);
          return response.exist;
        })
      );
  }

  //check IF Password and Email is right

  //-------------------------------------------- Post-Requests --------------------------------------------------------------//
  createUser(user: User) {
    let isAdmin = false;
    let isProjectManager = false;
    console.log(user.role);
    if (user.role === Role.ADMIN) {
      isAdmin = true;
    }
    if (user.role === Role.MANAGER) {
      isProjectManager = true;
    }

    let salt = this.encryptionService.generateSalt();
    let passwordHash = this.encryptionService.encryptPBKDF2(
      user.password,
      salt
    );

    const createUser = {
      userName: user.username,
      firstName: user.firstname,
      lastName: user.lastname,
      email: user.email,
      passwordHash: passwordHash,
      salt: salt,
      isAdmin: isAdmin,
      isProjectManager: isProjectManager,
    };
    return this.http.post(`${this.apiConfig.baseURL}/users`, createUser);
  }

  //-------------------------------------------- Put-Requests --------------------------------------------------------------//
  updateUser(user: User) {
    const updateUser = {
      userID: user.userID,
      userName: user.username,
      firstName: user.firstname,
      lastName: user.lastname,
      email: user.email,
      passwordHash: user.password,
      role: user.role,
    };
    console.log(updateUser);
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
    console.log(response);
    const role =
      response.role === Role.ADMIN
        ? Role.ADMIN
        : response.role === Role.MANAGER
        ? Role.MANAGER
        : Role.USER;

    const lastLogin = new NiceDate(
      response.lastLogin.year,
      response.lastLogin.month,
      response.lastLogin.day,
      response.lastLogin.hour,
      response.lastLogin.minute
    );

    return new User(
      response.userID,
      response.userName,
      response.firstName,
      response.lastName,
      response.passwordHash,
      role,
      response.email,
      lastLogin
    );
  }
}
