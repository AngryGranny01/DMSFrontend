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
  private userFirstAndLastNameSubscription!: Subscription;

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.userFirstAndLastNameSubscription = this.userService.currentUserFirstAndLastName$.subscribe((userName) => {
      this.loginName = userName;
    });
  }

  ngOnDestroy(): void {
    this.userFirstAndLastNameSubscription.unsubscribe();
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
