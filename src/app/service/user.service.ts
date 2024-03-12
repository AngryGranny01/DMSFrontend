import { Injectable } from '@angular/core';
import { User } from '../models/userInterface';
import { Role } from '../models/role';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { NiceDate } from '../models/niceDateInterface';
import { Log } from '../models/logInterface';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  users$: Observable<User[]> = of([]);
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
  private selectedUser!: User;

  constructor(private http: HttpClient) { }

  isAdmin(): boolean {
    if (this.currentUser === undefined || this.currentUser.role !== Role.ADMIN) {
      return false;
    }
    return true;
  }

  getCurrentUserID(){
    return this.currentUser.userId
  }

  //--------------------- Getter and Setter -------------------------------------//
  setSelectedUser(user: User) {
    this.selectedUser = user;
  }

  getSelectedUser() {
    return this.selectedUser;
  }

  getCurrentUser(){

  }
}
