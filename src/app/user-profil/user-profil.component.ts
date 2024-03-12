import { Component } from '@angular/core';
import { UserService } from '../service/user.service';
import { User } from '../models/userInterface';
import { Role } from '../models/role';
import { NiceDate } from '../models/niceDateInterface';
import { UserDataService } from '../service/api/user-data.service';
import { UserManagmentPageComponent } from '../user-managment-page/user-managment-page.component';
import { Router } from '@angular/router';
import { ProjectManagerDataService } from '../service/api/project-manager-data.service';

@Component({
  selector: 'app-user-profil',
  templateUrl: './user-profil.component.html',
  styleUrl: './user-profil.component.css',
  providers: [UserManagmentPageComponent],
})
export class UserProfilComponent {
  selectedRole: Role = Role.USER; // Default selected role
  user!: User;

  constructor(
    private userService: UserService,
    private userDataService: UserDataService,
    private managerDataService: ProjectManagerDataService,
    private userManagementPageComponent: UserManagmentPageComponent,
    private router: Router
  ) {}
  isEditMode: boolean = false;

  ngOnInit() {
    // Check if the user data is available (in edit mode)

    if (this.userService.isEditMode) {
      this.isEditMode = true;
      this.user = this.userService.getSelectedUser();
      this.selectedRole = this.user.role; // Load user data into the form fields
    } else {
      this.isEditMode = false;
      this.user = new User(
        0,
        '',
        '',
        '',
        '',
        Role.USER,
        '',
        new NiceDate(0, 0, 0, 0, 0)
      );
    }
  }

  isAdmin(): boolean {
    return this.userService.isAdmin();
  }

  saveProfile() {
    // Get new user data from HTML form
    const updatedUser: User = {
      ...this.user,
    };
    updatedUser.role = this.selectedRole;

    if (
      this.isEditMode &&
      this.user.email === this.userService.getSelectedUser().email
    ) {
      // Email hasn't been changed, proceed with updating the user profile
      this.updatedSelectedUser(updatedUser);
    } else {
      this.userDataService.checkIfUserEmailExists(updatedUser.email).subscribe(
        (exists) => {
          if (exists) {
            // Email already exists, display an alert in the HTML
            alert('Email already exists.');
          } else {
            if (this.isEditMode) {
              // Logic to update user profile
              this.updatedSelectedUser(updatedUser);
            } else {
              // Logic to create new user profile
              this.createNewUser(updatedUser);
            }
          }
        },
        (error) => {
          // Handle error checking email existence
          console.error('Error checking if email exists:', error);
        }
      );
    }
  }

  updatedSelectedUser(user: User) {
    if (user.role === Role.USER && Role.USER !== this.userService.getSelectedUser().role) {
      const confirmResetToUser = confirm(
        'Wenn Sie den Benutzer auf "User" zurücksetzen, werden Sie zum Projektmanager für die offenen Projekte. Möchten Sie fortfahren?'
      );
      if (!confirmResetToUser) {
        return; // User canceled the operation
      }
      // Get Manager ID of the clicked User
      this.managerDataService.getManagerID(user.userId).subscribe(
        (managerID) => {
          console.log(managerID);
          // Update the Manager ID of the clicked User with the managerID of the person who deleted the user
          this.managerDataService.updateManagerID(this.userService.getCurrentUserID(), managerID).subscribe(
            () => {
              console.log(this.userService.getCurrentUserID())
              //delete Manager ID

              this.managerDataService.deleteProjectManager(managerID).subscribe(
                () => {
                  // Refresh user data after successful deletion
                  this.updateUserAndNavigate(user);
                },
                (error) => {
                  // Handle error deleting user
                  console.error('Error deleting Project Manager:', error);
                  // Optionally, notify the user about the error
                }
              );
            },
            (error) => {
              // Handle error updating manager ID
              console.error('Error updating manager ID:', error);
            }
          );
        },
        (error) => {
          // Handle error getting manager ID
          console.error('Error getting manager ID:', error);
        }
      );
    } else {
      // If the role is not USER or the role hasn't changed, proceed with updating the user
      this.updateUserAndNavigate(user);
    }
  }


  updateUserAndNavigate(user: User) {
    this.userDataService.updateUser(user).subscribe(
      () => {
        // Handle successful update
        this.userManagementPageComponent.refreshUsers();
        // Log Entry
        this.router.navigate(['/userManagment']);
        console.log('User profile updated:', user);
      },
      (error) => {
        // Handle error
        console.error('Error updating user profile:', error);
      }
    );
  }


  createNewUser(user: User) {
    this.userDataService.createUser(user).subscribe(
      () => {
        // Handle successful creation
        this.userManagementPageComponent.refreshUsers();
        //TODO: Log Entry
        this.router.navigate(['/userManagment']);
        console.log('New user profile created:', user);
      },
      (error) => {
        // Handle error
        console.error('Error creating user profile:', error);
      }
    );
  }
}
