import { Injectable } from '@angular/core';
import { User } from '../models/userInterface';
import { Role } from '../models/role';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  // Initialize currentUser with default values for properties
  public currentUser: User = {
    userID: 0,
    userName: '',
    firstName: '',
    lastName: '',
    salt: '',
    email: '',
    role: Role.USER,
    orgEinheit: '',
  };

  public isEditMode: boolean = true;
  private selectedUser!: User;
  public currentUsername: BehaviorSubject<string> = new BehaviorSubject<string>(
    ''
  );
  public currentUser$: BehaviorSubject<User> = new BehaviorSubject<User>(this.currentUser)

  constructor() {}

  /**
   * Checks if the current user is an admin.
   * @returns A boolean indicating if the current user is an admin.
   */
  isAdmin(): boolean {
    return (
      this.currentUser !== undefined && this.currentUser.role === Role.ADMIN
    );
  }

  /**
   * Checks if the selected user is an admin.
   * @returns A boolean indicating if the selected user is an admin.
   */
  selectedUserIsAdmin(): boolean {
    return (
      this.selectedUser !== undefined && this.selectedUser.role === Role.ADMIN
    );
  }

  /**
   * Concatenates the first name and last name.
   * @param firstname The first name.
   * @param lastname The last name.
   * @returns The concatenated full name.
   */
  concatenateFirstnameLastname(firstname: string, lastname: string): string {
    return `${firstname} ${lastname}`;
  }

  /**
   * Retrieves the current user ID.
   * @returns The current user ID.
   */
  getCurrentUserID(): number {
    return this.currentUser.userID;
  }

  /**
   * Retrieves the current username.
   * @returns The current username.
   */
  getCurrentUsername(): string {
    return this.currentUser.userName;
  }

  //--------------------- Getter and Setter -------------------------------------//

  /**
   * Sets the selected user.
   * @param user The selected user.
   */
  setSelectedUser(user: User): void {
    this.selectedUser = user;
  }

  /**
   * Retrieves the selected user.
   * @returns The selected user.
   */
  getSelectedUser(): User {
    return this.selectedUser;
  }

  /**
   * Retrieves the current user.
   * @returns The current user.
   */
  getCurrentUser(): User {
    return this.currentUser;
  }

  /**
   * Checks if the password meets the strength requirements.
   * @param password The password to check.
   * @returns A boolean indicating if the password is strong.
   */
  isPasswordStrong(password: string): boolean {
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return passwordRegex.test(password);
  }

  /**
   * Checks if the email is in a valid format.
   * @param email The email to check.
   * @returns A boolean indicating if the email is valid.
   */
  checkIfEmailIsValidEmail(email: string): boolean {
    const emailPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }
}
