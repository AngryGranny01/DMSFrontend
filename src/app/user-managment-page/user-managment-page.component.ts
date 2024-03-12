import { Component } from '@angular/core';
import { UserService } from '../service/user.service';
import { UserDataService } from '../service/api/user-data.service';
import { ProjectManagerDataService } from '../service/api/project-manager-data.service';
import { HttpClient } from '@angular/common/http';
import { NiceDate } from '../models/niceDateInterface';
import { User } from '../models/userInterface';
import { Log } from '../models/logInterface';
import { Observable, Subscription, of } from 'rxjs';
import { Role } from '../models/role';

@Component({
  selector: 'app-user-managment-page',
  templateUrl: './user-managment-page.component.html',
  styleUrl: './user-managment-page.component.css',
})
export class UserManagmentPageComponent {
  users$: Observable<User[]> = of([]); // Initialize with an empty observable array

  constructor(
    private userService: UserService,
    private userDataService: UserDataService,
    private managerDataService: ProjectManagerDataService
  ) {}

  ngOnInit(): void {
    this.loadAllUsers();
  }

  setEditModeToNewUser() {
    this.userService.isEditMode = false;
  }

  loadAllUsers() {
    this.users$ = this.userDataService.getAllUsers();
  }

  deleteUser(user: User) {
    if (user.role === Role.MANAGER) {
      const confirmDelete = confirm(
        'Wenn Sie diesen Benutzer löschen, werden Sie zum Projektmanager für offene Projekte. Möchten Sie fortfahren?'
      );
      if (!confirmDelete) {
        return; // User canceled the delete operation
      }

      // Get Manager ID of the clicked User
      this.managerDataService.getManagerID(user.userId).subscribe(
        (managerID) => {
          console.log(managerID);
          // Update the Manager ID of the clicked User with the managerID of the person who deleted the user
          this.managerDataService.updateManagerID(this.userService.getCurrentUserID(), managerID).subscribe(
            () => {
              // After successful update, delete the user
              this.userDataService.deleteUser(user.userId).subscribe(
                () => {
                  // Refresh user data after successful deletion
                  this.refreshUsers();
                },
                (error) => {
                  // Handle error deleting user
                  console.error('Error deleting user:', error);
                  // Optionally, notify the user about the error
                }
              );
            },
            (error) => {
              // Handle error updating manager ID
              console.error('Error updating manager ID:', error);
              // Optionally, notify the user about the error
            }
          );
        },
        (error) => {
          // Handle error getting manager ID
          console.error('Error getting manager ID:', error);
          // Optionally, notify the user about the error
        }
      );
    } else {
      this.userDataService.deleteUser(user.userId).subscribe(
        () => {
          // Refresh user data after successful deletion
          this.refreshUsers();
        },
        (error) => {
          // Handle error deleting user
          console.error('Error deleting user:', error);
          // Optionally, notify the user about the error
        }
      );
    }
  }


  refreshUsers() {
    this.loadAllUsers();
  }
}
