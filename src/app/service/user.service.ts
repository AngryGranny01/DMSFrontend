import { Injectable } from '@angular/core';
import { User } from '../models/userInterface';
import { Role } from '../models/role';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  public currentUser: User = this.getStoredUser() || {
    userID: 0,
    firstName: '',
    lastName: '',
    email: '',
    role: Role.USER,
    orgUnit: '',
    isDeactivated: true,
  };

  public isEditMode: boolean = true;
  private selectedUser!: User;
  public currentUserFirstAndLastName$: BehaviorSubject<string> = new BehaviorSubject<string>(
    this.concatenateFirstnameLastname(this.currentUser.firstName, this.currentUser.lastName)
  );
  public currentUser$: BehaviorSubject<User> = new BehaviorSubject<User>(this.currentUser);

  constructor() {}

  private getStoredUser(): User | null {
    const user = sessionStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  private storeUser(user: User): void {
    sessionStorage.setItem('currentUser', JSON.stringify(user));
  }

  private clearStoredUser(): void {
    sessionStorage.removeItem('currentUser');
  }

  setCurrentUser(user: User): void {
    this.currentUser = user;
    this.storeUser(user);
    this.currentUser$.next(user);
    const fullName = this.concatenateFirstnameLastname(user.firstName, user.lastName);
    this.currentUserFirstAndLastName$.next(fullName);
  }

  clearCurrentUser(): void {
    this.currentUser = {
      userID: 0,
      firstName: '',
      lastName: '',
      email: '',
      role: Role.USER,
      orgUnit: '',
      isDeactivated: true,
    };
    this.clearStoredUser();
    this.currentUser$.next(this.currentUser);
    this.currentUserFirstAndLastName$.next('');
  }

  isAdmin(): boolean {
    return this.currentUser.role === Role.ADMIN;
  }

  selectedUserIsAdmin(): boolean {
    return this.selectedUser?.role === Role.ADMIN;
  }

  concatenateFirstnameLastname(firstname: string, lastname: string): string {
    return `${firstname} ${lastname}`;
  }

  getCurrentUserID(): number {
    return this.currentUser.userID;
  }

  getCurrentFirstAndLastName(): string {
    return this.concatenateFirstnameLastname(this.currentUser.firstName, this.currentUser.lastName);
  }

  setSelectedUser(user: User): void {
    this.selectedUser = user;
  }

  getSelectedUser(): User {
    return this.selectedUser;
  }

  getCurrentUser(): User {
    return this.currentUser;
  }

  getUserDeactivationStatus(user: User) {
    return user.isDeactivated;
  }

  isPasswordStrong(password: string): boolean {
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return passwordRegex.test(password);
  }

  checkIfEmailIsValidEmail(email: string): boolean {
    const emailPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }
}
