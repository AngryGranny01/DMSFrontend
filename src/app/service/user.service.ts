import { Injectable } from '@angular/core';
import { User } from '../models/userInterface';
import { Role } from '../models/role';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { NiceDate } from '../models/niceDateInterface';
import { Log } from '../models/logInterface';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  public currentUser: User = {
    userId: 0,
    username: '',
    firstname: '',
    lastname: '',
    password: '',
    email: '',
    role: Role.USER,
    lastLogin: new NiceDate(2022,2,4,14,0)
  }; // Initialize currentUser with default values for properties

  private usersUrl = 'assets/mockUsers.json'; // JSON file URL
  private logsUrl = 'assets/mockLogsUsers.json'; // JSON file URL
  public isEditMode: boolean = true;

  constructor(private http: HttpClient) { }

  isAdmin(): boolean {
    if (this.currentUser === undefined || this.currentUser.role !== Role.ADMIN) {
      return false;
    }
    return true;
  }
  getUsers(): Observable<User[]> {
    return this.http.get<any>(this.usersUrl).pipe(
      // Use the map operator to extract the 'users' array from the response
      map(response => response.users)
    );
  }

  getLogs(): Observable<Log[]> {
    return this.http.get<any>(this.logsUrl).pipe(
      map(response => response.logs)
    );
  }

}
