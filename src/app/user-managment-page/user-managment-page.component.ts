import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Role } from '../models/role';
import { User } from '../models/userInterface';
import { Log } from '../models/logInterface';
import { ActivityName } from '../models/activityName';
import { LogDescriptionValues } from '../models/logDescriptionValues';
import { NiceDate } from '../models/niceDateInterface';
import { UserService } from '../service/user.service';
import { UserDataService } from '../service/api/user-data.service';
import { ProjectManagerDataService } from '../service/api/project-manager-data.service';
import { LogService } from '../service/log.service';
import { LogDataService } from '../service/api/log-data.service';
import { NiceDateService } from '../service/nice-date.service';
import { STANDARD_PUBLIC_KEY } from '../constants/env';

@Component({
  selector: 'app-user-managment-page',
  templateUrl: './user-managment-page.component.html',
  styleUrls: ['./user-managment-page.component.css'],
})
export class UserManagmentPageComponent implements OnInit {
  users$: Observable<User[]> = of([]);
  lastLogin$: Observable<{ [userID: string]: Date }> = of({});

  constructor(
    private userService: UserService,
    private userDataService: UserDataService,
    private managerDataService: ProjectManagerDataService,
    private logService: LogService,
    private logDataService: LogDataService,
    public niceDate: NiceDateService
  ) {}

  ngOnInit(): void {
    this.loadAllUsers();
  }

  openUserLogs(user: User) {
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
    this.lastLogin$ = this.userDataService.getLastLogins(
      this.userService.currentUser.userID,
      this.userService.currentUser.privateKey
    );
  }

  createDateString(lastLogin: Date | undefined): Observable<string> {
    if (!lastLogin) return of(''); // Return an empty string Observable
    const date = this.niceDate.formatDate(lastLogin);
    return of(`${date}`);
  }

  createTimeString(lastLogin: Date | undefined): Observable<string> {
    if (!lastLogin) return of(''); // Return an empty string Observable
    const time = this.niceDate.formatTime(lastLogin);
    return of(`${time} Uhr`);
  }

  isActivated(user: User): boolean {
    return user.publicKey !== STANDARD_PUBLIC_KEY;
  }

  deleteUser(user: User) {
    if (user.role === Role.MANAGER) {
      const confirmDelete = confirm(
        'Wenn Sie diesen Benutzer löschen, werden Sie zum Projektmanager für offene Projekte. Möchten Sie fortfahren?'
      );
      if (!confirmDelete) {
        return;
      }

      this.managerDataService.getManagerID(user.userID).subscribe(
        (managerID) => {
          this.managerDataService
            .updateManagerID(this.userService.getCurrentUserID(), managerID)
            .subscribe(
              () => {
                this.userDataService.deleteUser(user.userID).subscribe(
                  () => {
                    this.refreshUsers();
                    this.logDataService.addDeleteUserLog(user);
                  },
                  (error) => console.error('Error deleting user:', error)
                );
              },
              (error) => console.error('Error updating manager ID:', error)
            );
        },
        (error) => console.error('Error getting manager ID:', error)
      );
    } else {
      this.userDataService.deleteUser(user.userID).subscribe(
        () => {
          //Log Entry
          this.logDataService.addDeleteUserLog(user);

          this.refreshUsers();
        },
        (error) => console.error('Error deleting user:', error)
      );
    }
  }

  refreshUsers() {
    this.loadAllUsers();
  }
}
