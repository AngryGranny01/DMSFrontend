import { Component } from '@angular/core';
import { UserService } from '../service/user.service';
import { User } from '../models/userInterface';
import { Role } from '../models/role';
import { NiceDate } from '../models/niceDateInterface';
import { UserDataService } from '../service/api/user-data.service';
import { ProjectManagerDataService } from '../service/api/project-manager-data.service';
import { LogDataService } from '../service/api/log-data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-profil',
  templateUrl: './user-profil.component.html',
  styleUrls: ['./user-profil.component.css'],
})
export class UserProfilComponent {
  selectedRole: Role = Role.USER;
  user!: User;

  email: string = '';
  password: string = ''; // Property to store the password
  repeatPassword: string = ''; // Property to store the repeat password

  constructor(
    private userService: UserService,
    private userDataService: UserDataService,
    private managerDataService: ProjectManagerDataService,
    private logDataService: LogDataService,
    private router: Router
  ) {}

  isEditMode: boolean = false;

  ngOnInit() {
    if (this.userService.isEditMode) {
      this.isEditMode = true;
      this.user = this.userService.getSelectedUser();
      this.password = this.user.password;
      this.email = this.user.email;
      this.selectedRole = this.user.role;
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
    if (!this.isPasswordStrong(this.password)) {
      alert(
        'Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, and one number'
      );
      return;
    }

    if (this.password !== this.repeatPassword) {
      alert('Passwords do not match');
      return;
    }
    if (!this.checkIfEmailIsValidEmail(this.email)) {
      alert('Email isnt a valid email');
      return;
    }
    this.user.email = this.email;
    this.user.password = this.password;
    const updatedUser: User = {
      ...this.user,
      role: this.selectedRole,
    };

    if (
      this.isEditMode &&
      this.user.email === this.userService.getSelectedUser().email
    ) {
      this.updateSelectedUser(updatedUser);
      return;
    }

    this.userDataService.checkIfUserNameExists(updatedUser.username).subscribe(
      (usernameExists) => {
        if (usernameExists) {
          alert('Username already exists.');
          return;
        }

        this.userDataService
          .checkIfUserEmailExists(updatedUser.email)
          .subscribe(
            (emailExists) => {
              if (emailExists) {
                alert('Email already exists.');
                return;
              }

              this.isEditMode
                ? this.updateSelectedUser(updatedUser)
                : this.createNewUser(updatedUser);
            },
            (emailError) => {
              console.error('Error checking if email exists:', emailError);
            }
          );
      },
      (usernameError) => {
        console.error('Error checking if username exists:', usernameError);
      }
    );
  }

  updateSelectedUser(user: User) {
    if (
      user.role === Role.USER &&
      Role.USER !== this.userService.getSelectedUser().role
    ) {
      const confirmResetToUser = confirm(
        'Wenn Sie den Benutzer auf "User" zurücksetzen, werden Sie zum Projektmanager für die offenen Projekte. Möchten Sie fortfahren?'
      );
      if (!confirmResetToUser) {
        return;
      }

      this.managerDataService.getManagerID(user.userID).subscribe(
        (managerID) => {
          this.managerDataService
            .updateManagerID(this.userService.getCurrentUserID(), managerID)
            .subscribe(
              () => {
                this.managerDataService
                  .deleteProjectManager(managerID)
                  .subscribe(
                    () => {
                      this.updateUserAndNavigate(user);
                    },
                    (error) => {
                      console.error('Error deleting Project Manager:', error);
                    }
                  );
              },
              (error) => {
                console.error('Error updating manager ID:', error);
              }
            );
        },
        (error) => {
          console.error('Error getting manager ID:', error);
        }
      );
    } else {
      this.updateUserAndNavigate(user);
    }
  }

  updateUserAndNavigate(user: User) {
    this.userDataService.updateUser(user).subscribe(
      () => {
        this.logDataService.addUpdateUserLog(user);
        this.router.navigate(['/userManagment']);
      },
      (error) => {
        console.error('Error updating user profile:', error);
      }
    );
  }

  createNewUser(user: User) {
    this.userDataService.createUser(user).subscribe(
      (response: any) => {
        this.logDataService
          .addCreateUserLog(response.userID, user.username)
          .subscribe(
            () => {
              this.router.navigate(['/userManagment']);
            },
            (logError) => {
              console.error('Error creating log entry:', logError);
            }
          );
      },
      (error) => {
        console.error('Error creating user profile:', error);
      }
    );
  }

  isPasswordStrong(password: string): boolean {
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return passwordRegex.test(password);
  }

  checkIfEmailIsValidEmail(email: string): boolean {
    // Regular expression pattern for basic email format validation
    const emailPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Test if the email matches the pattern
    return emailPattern.test(email);
  }
}
