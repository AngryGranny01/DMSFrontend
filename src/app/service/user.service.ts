import { Injectable } from '@angular/core';
import { User } from '../models/userInterface';
import { Role } from '../models/role';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  public currentUser: User = {
    username: '',
    firstname: '',
    lastname: '',
    password: '',
    email: '',
    role: Role.USER
  }; // Initialize currentUser with default values for properties

  public isEditMode: boolean = true;

  constructor() { }

  isAdmin(): boolean {
    if (this.currentUser === undefined || this.currentUser.role !== Role.ADMIN) {
      return false;
    }
    return true;
  }
}
