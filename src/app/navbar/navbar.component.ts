// In navbar.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { UserService } from '../service/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  loginName: string = '';
  lastLogin: string = '';
  private userFirstAndLastNameSubscription!: Subscription;
  private lastLoginSubscription!: Subscription;

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.userFirstAndLastNameSubscription = this.userService.currentUserFirstAndLastName$.subscribe((userName) => {
      this.loginName = userName;
    });

    this.lastLoginSubscription = this.userService.getLastLoginTime().subscribe((lastLogin) => {
      this.lastLogin = lastLogin;
    });
  }

  ngOnDestroy(): void {
    this.userFirstAndLastNameSubscription.unsubscribe();
    this.lastLoginSubscription.unsubscribe();
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  logOut() {
    this.loginName = '';
    this.authService.logout();
  }

  setEditModeToEditUser() {
    this.userService.setSelectedUser(this.userService.currentUser);
    this.userService.isEditMode = true;
  }
}
