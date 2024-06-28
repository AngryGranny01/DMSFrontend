import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import { UserService } from '../service/user.service';
import { User } from '../models/userInterface';
import { Role } from '../models/role';
import { UserDataService } from '../service/api/user-data.service';
import { ProjectManagerDataService } from '../service/api/project-manager-data.service';
import { LogDataService } from '../service/api/log-data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-profil',
  templateUrl: './user-profil.component.html',
  styleUrls: ['./user-profil.component.css'],
})
export class UserProfilComponent implements OnInit {
  profileForm: FormGroup;
  user!: User;
  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private userDataService: UserDataService,
    private managerDataService: ProjectManagerDataService,
    private logDataService: LogDataService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      userName: ['', Validators.required],
      orgUnit: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.minLength(8)],
      repeatPassword: ['', Validators.minLength(8)],
      role: new FormControl(
        { value: '', disabled: false },
        Validators.required
      ),
    });
  }

  ngOnInit(): void {
    this.initializeUser();
  }

  initializeUser(): void {
    if (this.userService.isEditMode) {
      this.isEditMode = true;
      this.user = this.userService.getSelectedUser();
      this.profileForm.patchValue({
        orgUnit: this.user.orgUnit,
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        email: this.user.email,
        role: this.user.role,
      });
      this.profileForm.get('role')?.setValue(this.user.role); // Default role
    } else {
      this.isEditMode = false;
      this.user = {
        userID: 0,
        firstName: '',
        lastName: '',
        email: '',
        role: Role.USER,
        orgUnit: '',
        isDeactivated: false,
      };
      this.profileForm.get('role')?.setValue(Role.USER); // Default role

      this.profileForm.reset();
    }

    if (
      (this.profileForm.get('role')?.value === Role.ADMIN && this.isAdmin()) ||
      !this.isAdmin()
    ) {
      this.profileForm.get('role')?.disable();
    }
    if (this.isAdmin() && this.profileForm.get('role')?.value !== Role.ADMIN) {
      const adminRadio = document.getElementById('ADMIN') as HTMLInputElement;
      if (adminRadio) {
        adminRadio.disabled = true;
      }
    }
  }

  isAdmin(): boolean {
    return this.userService.isAdmin();
  }

  selectedUserIsAdmin(): boolean {
    return this.userService.selectedUserIsAdmin();
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      return;
    }

    if (this.isEditMode) {
      if (
        !this.userService.isPasswordStrong(this.profileForm.value.password) &&
        this.profileForm.value.password !== ''
      ) {
        alert(
          'Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, and one number'
        );
        return;
      }

      if (
        this.profileForm.value.password !==
        this.profileForm.value.repeatPassword
      ) {
        alert('Passwords do not match');
        return;
      }
    }

    if (
      !this.userService.checkIfEmailIsValidEmail(this.profileForm.value.email)
    ) {
      alert('Email is not a valid email');
      return;
    }

    const updatedUser: User = {
      ...this.user,
      ...this.profileForm.value,
    };

    if (
      this.isEditMode &&
      this.user.email === this.userService.getSelectedUser().email
    ) {
      this.updateSelectedUser(updatedUser);
      return;
    }

    this.userDataService.checkIfUserEmailExists(updatedUser.email).subscribe(
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
        this.logDataService.addErrorUserLog(
          `Error checking if email: ${updatedUser.email} exists`
        ),
          console.error('Error checking if email exists:', emailError);
      }
    );
  }

  updateSelectedUser(user: User): void {
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
                      this.logDataService.addErrorUserLog(
                        `Error deleting Project Manager with id: ${managerID}`
                      ),
                        console.error('Error deleting Project Manager:', error);
                    }
                  );
              },
              (error) => {
                this.logDataService.addErrorUserLog(
                  `Error updating Project Manager with ID: ${managerID}`
                ),
                  console.error('Error updating manager ID:', error);
              }
            );
        },
        (error) => {
          this.logDataService.addErrorUserLog(`${error.message}`),
            console.error('Error getting manager ID:', error);
        }
      );
    } else {
      this.updateUserAndNavigate(user);
    }
  }

  updateUserAndNavigate(user: User): void {
    if (user.userID === this.userService.currentUser.userID) {
      this.userService.currentUser = user;
      this.userService.currentUserFirstAndLastName$.next(
        this.userService.concatenateFirstnameLastname(
          this.user.firstName,
          this.user.lastName
        )
      );
    }
    this.userDataService
      .updateUser(user, this.profileForm.value.password)
      .subscribe(
        () => {
          this.logDataService.addUpdateUserLog(user);
          this.router.navigate(['/userManagment']);
        },
        (error) => {
          this.logDataService.addErrorUserLog(
            `Error updating user profile with userID: ${user.userID}`
          ),
            console.error('Error updating user profile:', error);
        }
      );
  }

  createNewUser(user: User): void {
    this.userDataService.createUser(user).subscribe(
      (response: any) => {
        //this.logDataService.addCreateUserLog(response.userID, user.userName);
        this.router.navigate(['/userManagment']);
      },
      (error) => {
        this.logDataService.addErrorUserLog(`Error creating user profile`),
          console.error('Error creating user profile:', error);
      }
    );
  }

  cancel(): void {
    this.router.navigate(['/userManagment']);
  }
}
