import { Injectable } from '@angular/core';
import { User } from '../models/userInterface';
import { Role } from '../models/role';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, of } from 'rxjs';
import { NiceDate } from '../models/niceDateInterface';
import { Log } from '../models/logInterface';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  public currentUser: User = {
    userID: 0,
    username: '',
    firstname: '',
    lastname: '',
    password: '',
    email: '',
    role: Role.USER,
    lastLogin: new NiceDate(2022, 2, 4, 14, 0),
  }; // Initialize currentUser with default values for properties

  public isEditMode: boolean = true;
  private selectedUser!: User;
  public currentUsername: BehaviorSubject<string> = new BehaviorSubject<string>("");

  constructor() {}

  isAdmin(): boolean {
    if (
      this.currentUser === undefined ||
      this.currentUser.role !== Role.ADMIN
    ) {
      return false;
    }
    return true;
  }

  concatenateFirstnameLastname(firstname: string, lastname: string): string {
    return firstname + ' ' + lastname;
  }
  getCurrentUserID(): number {
    return this.currentUser.userID;
  }

  getCurrentUsername(): string {
    return this.currentUser.username;
  }

  //--------------------- Getter and Setter -------------------------------------//
  setSelectedUser(user: User) {
    this.selectedUser = user;
  }

  getSelectedUser() {
    return this.selectedUser;
  }

  getCurrentUser(): User {
    return this.currentUser;
  }

  isPasswordStrong(password: string): boolean {
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return passwordRegex.test(password);
  }

  checkIfEmailIsValidEmail(email: string): boolean {
    // Regular expression pattern for basic email format validation
    const emailPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Test if the email matches the pattern
    return emailPattern.test(email);
  }
}
