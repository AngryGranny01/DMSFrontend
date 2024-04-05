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
    userName: '',
    firstName: '',
    lastName: '',
    privateKey: '',
    email: '',
    role: Role.USER,
    orgEinheit: '',
    publicKey: '',
  }; // Initialize currentUser with default values for properties

  public isEditMode: boolean = true;
  private selectedUser!: User;
  public currentUsername: BehaviorSubject<string> = new BehaviorSubject<string>(
    ''
  );

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

  selectedUserIsAdmin(): boolean {
    if (
      this.selectedUser === undefined ||
      this.selectedUser.role !== Role.ADMIN
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
    return this.currentUser.userName;
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
