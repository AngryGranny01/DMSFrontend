import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import { UserService } from '../service/user.service';
import { User } from '../models/userInterface';
import { Role } from '../models/roleEnum';
import { UserDataService } from '../service/api/user-data.service';
import { ProjectManagerDataService } from '../service/api/project-manager-data.service';
import { LogDataService } from '../service/api/log-data.service';
import { Router } from '@angular/router';
import { OrgUnit } from '../models/orgUnitsEnum';
import { EncryptionService } from '../service/encryption.service';

@Component({
  selector: 'app-user-profil',
  templateUrl: './user-profil.component.html',
  styleUrls: ['./user-profil.component.css'],
})
export class UserProfilComponent implements OnInit {
  profileForm: FormGroup;
  user!: User;
  isEditMode: boolean = false;
  changePassword: boolean = false;
  orgUnits = Object.values(OrgUnit); // Get the list of organizational units from the enum

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private userDataService: UserDataService,
    private logDataService: LogDataService,
    private router: Router
  ) {
    this.profileForm = this.fb.group(
      {
        orgUnit: ['', Validators.required],
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: [''],
        repeatPassword: [''],
        role: new FormControl('', Validators.required),
      },
      { validator: this.passwordMatchValidator }
    );
  }

  ngOnInit(): void {
    this.initializeUser();
  }

  passwordMatchValidator(formGroup: FormGroup): any {
    return formGroup.get('password')?.value ===
      formGroup.get('repeatPassword')?.value
      ? null
      : { mismatch: true };
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
      // If the current user is an admin, disable the admin role option for the edited user
      if (this.userService.currentUser.role !== Role.ADMIN) {
        this.disableRoleOptions();
      } else if (this.userService.currentUser.role === Role.ADMIN && this.user.role === Role.ADMIN){
        this.disableRoleOptions();
      }else if (this.userService.currentUser.role === Role.ADMIN) {
        const adminRadio = document.getElementById('ADMIN') as HTMLInputElement;
        adminRadio.disabled = true;
      }
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
      this.profileForm.reset({ role: Role.USER });
      //disable checkbox Role admin
      const adminRadio = document.getElementById('ADMIN') as HTMLInputElement;
      adminRadio.disabled = true;
    }
  }

  disableRoleOptions(): void {
    const adminRadio = document.getElementById('ADMIN') as HTMLInputElement;
    const projectManagerRadio = document.getElementById(
      'PROJECT_MANAGER'
    ) as HTMLInputElement;
    const userRadio = document.getElementById('USER') as HTMLInputElement;

    if (adminRadio) {
      adminRadio.disabled = true;
    }
    if (projectManagerRadio) {
      projectManagerRadio.disabled = true;
    }
    if (userRadio) {
      userRadio.disabled = true;
    }
  }

  getInvalidControls() {
    const invalid = [];
    const controls = this.profileForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  onSubmit(): void {
    console.log('Form Submitted', this.profileForm.value);
    console.log('Form Validity', this.profileForm.valid);

    if (this.profileForm.invalid) {
      console.log('Invalid Fields', this.getInvalidControls());
      return;
    }

    const updatedUser: User = {
      ...this.user,
      ...this.profileForm.value,
    };

    if (
      this.profileForm.value.password &&
      this.profileForm.value.password.trim() !== ''
    ) {
      this.userDataService
        .updatePassword(updatedUser.userID, this.profileForm.value.password)
        .subscribe(
          () => {
            this.finalizeUserUpdate(updatedUser);
            this.logDataService.addUpdatePasswordLog(updatedUser)
          },
          (error) => {
            console.error('Failed to update password:', error);
            alert('Failed to update password');
          }
        );
    } else {
      this.finalizeUserUpdate(updatedUser);
    }
  }

  finalizeUserUpdate(user: User): void {
    if (this.isEditMode) {
      this.updateSelectedUser(user);
    } else {
      this.createNewUser(user);
    }
  }

  updateSelectedUser(user: User): void {
    this.userDataService.updateUser(user).subscribe(
      () => {
        this.logDataService.addUpdateUserLog(user);
        this.router.navigate(['/userManagment']);
      },
      (error) => {
        console.error('Error updating user profile:', error);
        alert('Error updating user profile');
      }
    );
  }

  createNewUser(user: User): void {
    this.userDataService.createUser(user).subscribe(
      () => {
        this.router.navigate(['/userManagment']);
      },
      (error) => {
        console.error('Error creating user profile:', error);
        alert('Error creating user profile');
      }
    );
  }

  isAdmin(): boolean {
    return this.userService.isAdmin();
  }

  toggleChangePassword() {
    this.changePassword = !this.changePassword;
    if (!this.changePassword) {
      this.profileForm.get('password')?.setValue('');
      this.profileForm.get('repeatPassword')?.setValue('');
    }
  }

  cancel(): void {
    this.router.navigate(['/userManagment']);
  }
}
