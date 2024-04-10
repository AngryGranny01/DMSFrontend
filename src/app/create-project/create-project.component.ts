import { Component, ElementRef, ViewChild } from '@angular/core';
import { Observable, Subject, of, takeUntil } from 'rxjs';
import { Project } from '../models/projectInterface';
import { User } from '../models/userInterface';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { ProjectService } from '../service/project.service';
import { UserDataService } from '../service/api/user-data.service';
import { Role } from '../models/role';

import { UserService } from '../service/user.service';
import { ProjectManagerDataService } from '../service/api/project-manager-data.service';
import { Router } from '@angular/router';
import { ProjectDataService } from '../service/api/project-data.service';
import { LogService } from '../service/log.service';
import { LogDataService } from '../service/api/log-data.service';
import { EncryptionService } from '../service/encryption.service';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

@Component({
  selector: 'app-create-project',
  templateUrl: './create-project.component.html',
  styleUrl: './create-project.component.css',
  providers: [DashboardComponent],
})
export class CreateProjectComponent {
  @ViewChild('input') input!: ElementRef<HTMLInputElement>;
  myControl = new FormControl('');
  options: { fullName: string; userID: number }[] = []; // Initialize as an empty array
  filteredOptions: { fullName: string; userID: number }[] = [];

  startDateControl = new FormControl();
  project!: Project;

  myDate!: Date; // Property to bind the selected date
  minDate: Date = new Date(); // Property to set the minimum selectable date (today)
  maxDate!: Date;

  isEditMode: boolean = false;
  users$: Observable<User[]> = of([]);
  checkedUsers: User[] = []; // Array to store selected users
  selectedManager: { fullName: string; userID: number } = {
    fullName: '',
    userID: 0,
  };

  projectName: any;
  projectDescription: any;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private projectService: ProjectService,
    private userDataService: UserDataService,
    private userService: UserService,
    private projectManagerDataService: ProjectManagerDataService,
    private projectDataService: ProjectDataService,
    private logDataService: LogDataService,
    private encryptionService: EncryptionService,
    private router: Router
  ) {
    this.filteredOptions = this.options.slice();
  }

  ngOnInit() {
    if (this.projectService.isProjectEditMode) {
      this.isEditMode = true;
      this.project = this.projectService.getSelectedProject();
      this.setInputFieldsForEditProject();
    } else {
      this.isEditMode = false;
      this.setInputFieldsForNewProject();
    }
    this.loadAllUsers();
  }

  setInputFieldsForEditProject() {
    // Set Project Name Field
    this.projectName = this.project.name;
    // Set Project Manager Field
    this.selectedManager.fullName =
      this.userService.concatenateFirstnameLastname(
        this.project.manager.firstName,
        this.project.manager.lastName
      ) +
      ' (' +
      this.project.manager.orgEinheit +
      ')';

    this.selectedManager.userID = this.project.manager.userID;
    this.myControl = new FormControl(this.selectedManager.fullName);

    this.myDate = new Date(this.project.endDate);

    this.maxDate = new Date(
      this.myDate.getFullYear() + 5,
      this.myDate.getMonth(),
      this.myDate.getDate()
    );
    //set Project Description Field
    this.projectDescription = this.project.description;
    this.checkedUsers = this.project.users;
    console.log('Project: ', this.project.users);
  }

  setInputFieldsForNewProject() {
    //set Project Manager Field
    //set Date Field
    const today = new Date();
    this.maxDate = new Date(
      today.getFullYear() + 5,
      today.getMonth(),
      today.getDate()
    );
  }

  loadAllUsers() {
    this.users$ = this.userDataService.getAllUsers();
    this.users$.pipe(takeUntil(this.unsubscribe$)).subscribe((users) => {
      this.options = users
        .filter(
          (user) => user.role === Role.ADMIN || user.role === Role.MANAGER
        )
        .map((user) => ({
          fullName: `${user.firstName} ${user.lastName} (${user.orgEinheit})`,
          userID: user.userID,
        }));
      this.filteredOptions = [...this.options];
    });
  }

  userExistsInProject(user: User): boolean {
    if (this.project === undefined) {
      return false;
    }
    return !!this.project.users.find(
      (projectUser) => projectUser.userID === user.userID
    );
  }

  filter(): void {
    const filterValue = this.input.nativeElement.value.toLowerCase();
    this.filteredOptions = this.options.filter((option) => {
      return option.fullName.toLowerCase().includes(filterValue);
    });
  }

  //TODO:generate Project Key
  saveProject() {
    const selectedUser = this.findSelectedUser();
    this.addProjectManagerToUsers();
    // If the selected user is not found, display an alert and return
    if (!selectedUser) {
      alert('No Project Manager Selected');
      return;
    }
    const userID = selectedUser.userID;

    //TODO: Generate Project Key
    // Fetch the managerID and Password and Admin password corresponding to the userID
    this.projectManagerDataService.getManagerAndAdminPassword(userID).subscribe(
      (response: any) => {
        let projectKey: string = this.encryptionService.generateProjectKey(
          response.adminPasswordHash,
          response.managerPasswordHash
        );

        const projectData = {
          projectID: 0,
          projectName: this.projectName,
          projectDescription: this.projectDescription,
          projectKey: projectKey,
          projectEndDate: this.myDate,
          managerID: response.managerID,
          userIDs: this.checkedUsers.map((user) => ({
            userID: user.userID,
          })), // Get only the IDs of selected users
        };
        console.log('Checked Users: ', this.checkedUsers);
        if (this.isEditMode === true) {
          projectData.projectID = this.project.projectID;
          this.updateProject(projectData);
        } else {
          this.createNewProject(projectData);
        }
      },
      (error) => {
        // Handle error if the managerID fetching fails
        console.error('Error fetching managerID:', error);
      }
    );
  }

  findSelectedUser(): any {
    // Get the value of the selected option from the FormControl
    const selectedOption = this.myControl.value;
    // Find the selected option in the options array
    const selectedUser = this.options.find(
      (option) => option.fullName === selectedOption
    );
    return selectedUser;
  }

  createNewProject(data: any) {
    let project = {
      projectName: data.projectName,
      projectDescription: data.projectDescription,
      projectKey: data.projectKey,
      projectEndDate: data.projectEndDate,
      managerID: data.managerID,
    };
    // Call the createProject method and wait for its completion
    this.projectDataService.createProject(project, data.userIDs).subscribe(
      (response: any) => {
        // Log Entry
        this.logDataService
          .addCreateProjectLog(response.projectID, project.projectName)
          .subscribe(
            () => {
              // After project creation is successful, navigate to the dashboard
              this.router.navigate(['/dashboard']);
            },
            (logError) => {
              // Handle error creating log entry
              console.error('Error creating log entry:', logError);
            }
          );
      },
      (error) => {
        // Handle error if project creation fails
        console.error('Error creating project:', error);
      }
    );
  }
  updateProject(data: any) {
    let project = {
      projectID: data.projectID,
      projectName: data.projectName,
      projectDescription: data.projectDescription,
      projectKey: data.projectKey,
      projectEndDate: data.projectEndDate,
      managerID: data.managerID,
    };
    // Call the createProject method and wait for its completion
    this.projectDataService.updateProject(project, data.userIDs).subscribe(
      () => {
        // Log Entry
        this.logDataService.addUpdateProjectLog(
          project.projectID,
          project.projectName
        );

        // After project creation is successful, navigate to the dashboard
        this.router.navigate(['/dashboard']);
      },
      (error) => {
        // Handle error if project update fails
        console.error('Error updating project:', error);
      }
    );
    this.router.navigate(['/dashboard']);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  toggleUserSelection(user: User) {
    const index = this.checkedUsers.findIndex(
      (checkedUser) => checkedUser.userID === user.userID
    );

    if (index !== -1) {
      // User is already selected, so remove it
      this.checkedUsers.splice(index, 1);
    } else {
      // User is not selected, so add it
      this.checkedUsers.push(user);
    }
  }

  addProjectManagerToUsers(){
    let selectedManager = this.findSelectedUser();
    const managerAlreadySelected = this.checkedUsers.find(user => user.userID === selectedManager.userID);

    if (!managerAlreadySelected) {
      this.checkedUsers.push(selectedManager);
    }
  }
}
