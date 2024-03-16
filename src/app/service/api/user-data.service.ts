import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { User } from '../../models/userInterface';
import { ApiConfigService } from './api-config.service';
import { Role } from '../../models/role';
import { NiceDate } from '../../models/niceDateInterface';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UserDataService {
  constructor(private http: HttpClient, private apiConfig: ApiConfigService) {}

  //-------------------------------------------- Login --------------------------------------------------------------//
  checkLoginData(userPassword: string, userEmail: string): Observable<User> {
    return this.http.get<any>(
      `${this.apiConfig.baseURL}/user/login?email=${userEmail}&passwordHash=${userPassword}`
    ).pipe(
      map(userData => {
        if (!userData) {
          throw new Error('User data not found');
        }

        // Assuming NiceDate is a class with constructor (year: number, month: number, day: number, hour: number, minute: number)
        let lastLogin = new NiceDate(userData.lastLogin.year, userData.lastLogin.month, userData.lastLogin.day, userData.lastLogin.hour, userData.lastLogin.minute);

        // Assuming User is a class with constructor (userID: number, userName: string, firstName: string, lastName: string, passwordHash: string, role: string, email: string, lastLogin: NiceDate)
        let user = new User(userData.userID, userData.userName, userData.firstName, userData.lastName, userData.passwordHash, userData.role, userData.email, lastLogin);
        return user;
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

    const createUser = {
      userName: user.username,
      firstName: user.firstname,
      lastName: user.lastname,
      email: user.email,
      passwordHash: user.password,
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

  extractUser(response: any) {
    console.log(response)
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
