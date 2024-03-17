import { Component } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { Router } from '@angular/router';
import { UserService } from '../service/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  loginName: string = "";
  private usernameSubscription!: Subscription;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.usernameSubscription = this.userService.currentUsername.subscribe(username => {
      this.loginName = username;
      console.log("Login Name: ", this.loginName);
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    this.usernameSubscription.unsubscribe();
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  logOut() {
    this.loginName = "";
    this.authService.logout();
  }

  setEditModeToEditUser() {
    this.userService.setSelectedUser(this.userService.currentUser);
    this.userService.isEditMode = true;
  }
}
