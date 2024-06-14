import { Component, OnInit } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { switchMap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Role } from '../models/role';
import { User } from '../models/userInterface';
import { UserService } from '../service/user.service';
import { UserDataService } from '../service/api/user-data.service';
import { ProjectManagerDataService } from '../service/api/project-manager-data.service';
import { LogService } from '../service/log.service';
import { LogDataService } from '../service/api/log-data.service';
import { NiceDateService } from '../service/nice-date.service';

@Component({
  selector: 'app-user-managment-page',
  templateUrl: './user-managment-page.component.html',
  styleUrls: ['./user-managment-page.component.css'],
})
export class UserManagmentPageComponent implements OnInit {
  users$: Observable<User[]> = of([]);
  lastLogin$: Observable<{ [userID: string]: Date }> = of({});
  private reloadUsers$ = new BehaviorSubject<void>(undefined);

  constructor(
    private userService: UserService,
    private userDataService: UserDataService,
    private managerDataService: ProjectManagerDataService,
    private logService: LogService,
    private logDataService: LogDataService,
    public niceDate: NiceDateService
  ) {}

  ngOnInit(): void {
    this.users$ = this.reloadUsers$.pipe(
      debounceTime(300), // Debounce to avoid rapid successive calls
      distinctUntilChanged(), // Ensure distinct reload triggers
      switchMap(() => this.userDataService.getAllUsers())
    );

    this.lastLogin$ = this.userService.currentUser$.pipe(
      switchMap((currentUser) =>
        this.userDataService.getLastLogins(currentUser.userID)
      )
    );

    this.reloadUsers(); // Initial load
  }

  // Opens user logs for viewing
  openUserLogs(user: User): void {
    this.logService.setIsProjectLog(false);
    this.userService.setSelectedUser(user);
  }

  // Sets edit mode to create a new user
  setEditModeToNewUser(): void {
    this.userService.isEditMode = false;
  }

  // Sets edit mode to edit an existing user
  editUser(user: User): void {
    this.userService.isEditMode = true;
    this.userService.setSelectedUser(user);
  }

  // Triggers reloading of all users
  reloadUsers(): void {
    this.reloadUsers$.next();
  }

  // Creates a formatted date string from the last login date
  createDateString(lastLogin: Date | undefined): Observable<string> {
    if (!lastLogin) return of('');
    const date = this.niceDate.formatDate(lastLogin);
    return of(`${date}`);
  }

  // Creates a formatted time string from the last login time
  createTimeString(lastLogin: Date | undefined): Observable<string> {
    if (!lastLogin) return of('');
    const time = this.niceDate.formatTime(lastLogin);
    return of(`${time} Uhr`);
  }

  // Checks if a user is activated based on their public key
  isActivated(user: User): boolean {
    return user.salt !== '';
  }

  // Deletes a user from the system
  deleteUser(user: User): void {
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
                    this.reloadUsers();
                    this.logDataService.addDeleteUserLog(user);
                  },
                  (error) => console.error('Error deleting user:', error)
                );
              },
              (error) => {
                this.logDataService.addErrorUserLog(`Error updating manager ID for user with userID: ${user.userID}`),
                  console.error('Error updating manager ID:', error);
              }
            );
        },
        (error) => {
          this.logDataService.addErrorUserLog(`Error getting manager ID for user with userID: ${user.userID}`),
            console.error('Error getting manager ID:', error);
        }
      );
    } else {
      this.userDataService.deleteUser(user.userID).subscribe(
        () => {
          // Log entry
          this.logDataService.addDeleteUserLog(user);
          this.reloadUsers();
        },
        (error) => {
          this.logDataService.addErrorUserLog(`Error deleting user`),
          console.error('Error deleting user:', error);
        }
      );
    }
  }
}
