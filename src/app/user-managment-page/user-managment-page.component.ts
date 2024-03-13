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
import { LogService } from '../service/log.service';
import { LogDataService } from '../service/api/log-data.service';

@Component({
  selector: 'app-user-managment-page',
  templateUrl: './user-managment-page.component.html',
  styleUrl: './user-managment-page.component.css',
})

//TODO: Log Entrys
export class UserManagmentPageComponent {
  users$: Observable<User[]> = of([]); // Initialize with an empty observable array

  constructor(
    private userService: UserService,
    private logService: LogService,
    private userDataService: UserDataService,
    private managerDataService: ProjectManagerDataService,
    private logDataService: LogDataService
  ) {}

  ngOnInit(): void {
    this.loadAllUsers();
  }

  openUserLogs(user: User) {
    //set project Log to false because User Log should be opened
    this.logService.setIsProjectLog(false);
    this.userService.setSelectedUser(user);
  }

  setEditModeToNewUser() {
    this.userService.isEditMode = false;
  }

  editUser(user: User) {
    this.userService.isEditMode = true;
    this.userService.setSelectedUser(user);
  }

  loadAllUsers() {
    this.users$ = this.userDataService.getAllUsers();
  }

  //TODO: Log Entrys
  deleteUser(user: User) {
    if (user.role === Role.MANAGER) {
      const confirmDelete = confirm(
        'Wenn Sie diesen Benutzer löschen, werden Sie zum Projektmanager für offene Projekte. Möchten Sie fortfahren?'
      );
      if (!confirmDelete) {
        return; // User canceled the delete operation
      }

      // Get Manager ID of the clicked User
      this.managerDataService.getManagerID(user.userID).subscribe(
        (managerID) => {
          console.log(managerID);
          // Update the Manager ID of the clicked User with the managerID of the person who deleted the user
          this.managerDataService
            .updateManagerID(this.userService.getCurrentUserID(), managerID)
            .subscribe(
              () => {
                // After successful update, delete the user
                this.userDataService.deleteUser(user.userID).subscribe(
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
      this.userDataService.deleteUser(user.userID).subscribe(
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
