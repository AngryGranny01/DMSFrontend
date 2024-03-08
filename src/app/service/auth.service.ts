import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from './user.service';

import {
  User,
  userAdmin,
  userProjectManager,
  userUser,
} from '../models/userInterface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isAuthenticated = false;

  constructor(private readonly router: Router,private userService: UserService) {}
  users: User[] = [userAdmin, userUser, userProjectManager];

  loginUsers(username: string, password: string) {
    let checkLogin: boolean = false;
    for (let i = 0; i < this.users.length; i++) {
      console.log("Im Called")
      if (
        username === this.users[i].username &&
        password === this.users[i].password
      ) {
        checkLogin = true;
        this.router.navigate(["/dashboard"]);
        this.userService.currentUser = this.users[i];
        this.isAuthenticated = true;
        break;
      }
    }
    if (!checkLogin) {
      alert('Username or Password is false');
    }
  }

  isLoggedIn(): boolean {
    // Check if currentUser is auth
    return this.isAuthenticated;
  }
  logout(): void {
    this.router.navigate(["/login"]);
    this.isAuthenticated = false;
  }
}
