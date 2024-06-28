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
  loginName: string = ''; // Holds the User First and Last Name for display in the navbar
  private userFirstAndLastNameSubscription!: Subscription; // Subscription to track changes in the user First and Last Name

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    // Subscribe to username changes
    this.userFirstAndLastNameSubscription =
      this.userService.currentUserFirstAndLastName$.subscribe((userName) => {
        this.loginName = userName; // Update loginName when username changes
      });
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    this.userFirstAndLastNameSubscription.unsubscribe();
  }

  // Checks if a user is logged in
  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  // Logs out the user
  logOut() {
    this.loginName = ''; // Clear the loginName
    this.authService.logout(); // Call the logout method in the AuthService
  }

  // Sets the edit mode to edit the current user's profile
  setEditModeToEditUser() {
    // Set the selected user to the current user and enable edit mode
    this.userService.setSelectedUser(this.userService.currentUser);
    this.userService.isEditMode = true;
  }
}
