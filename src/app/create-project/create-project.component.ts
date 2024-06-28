import {
  Component,
  ElementRef,
  ViewChild,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Observable, Subject, of, takeUntil } from 'rxjs';
import { Project } from '../models/projectInterface';
import { User } from '../models/userInterface';
import { FormControl } from '@angular/forms';
import { Role } from '../models/role';
import { ProjectService } from '../service/project.service';
import { UserDataService } from '../service/api/user-data.service';
import { UserService } from '../service/user.service';
import { ProjectManagerDataService } from '../service/api/project-manager-data.service';
import { Router } from '@angular/router';
import { ProjectDataService } from '../service/api/project-data.service';
import { LogDataService } from '../service/api/log-data.service';
import { EncryptionService } from '../service/encryption.service';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-create-project',
  templateUrl: './create-project.component.html',
  styleUrl: './create-project.component.css',
  providers: [DashboardComponent],
})
export class CreateProjectComponent implements OnInit, OnDestroy {
  @ViewChild('input') input!: ElementRef<HTMLInputElement>;
  myControl = new FormControl('');
  options: { fullName: string; userID: number }[] = [];
  filteredOptions: { fullName: string; userID: number }[] = [];

  startDateControl = new FormControl();
  project!: Project;

  myDate!: Date;
  minDate: Date = new Date();
  maxDate!: Date;

  isEditMode: boolean = false;
  users$: Observable<User[]> = of([]);
  checkedUsers: User[] = [];
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

  // Sets input fields when editing an existing project
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
      this.project.manager.orgUnit +
      ')';
    this.selectedManager.userID = this.project.manager.userID;
    this.myControl = new FormControl(this.selectedManager.fullName);

    this.myDate = new Date(this.project.endDate);
    this.maxDate = new Date(
      this.myDate.getFullYear() + 5,
      this.myDate.getMonth(),
      this.myDate.getDate()
    );
    // Set Project Description Field
    this.projectDescription = this.project.description;
    this.checkedUsers = this.project.users;
  }

  // Sets input fields when creating a new project
  setInputFieldsForNewProject() {
    const today = new Date();
    this.maxDate = new Date(
      today.getFullYear() + 5,
      today.getMonth(),
      today.getDate()
    );
  }

  // Loads all users from the server
  loadAllUsers() {
    this.users$ = this.userDataService.getAllUsers();

    this.users$.pipe(takeUntil(this.unsubscribe$)).subscribe((users) => {
      if (this.userService.currentUser.role === Role.PROJECT_MANAGER) {
        // Only load the current user into filter options if they are a Project Manager
        const currentUser = this.userService.currentUser;
        this.options = [
          {
            fullName: `${currentUser.firstName} ${currentUser.lastName} (${currentUser.orgUnit})`,
            userID: currentUser.userID,
          },
        ];
      } else {
        // Load all Project Managers or Admins into the options
        this.options = users
          .filter(
            (user) => user.role === Role.ADMIN || user.role === Role.PROJECT_MANAGER
          )
          .map((user) => ({
            fullName: `${user.firstName} ${user.lastName} (${user.orgUnit})`,
            userID: user.userID,
          }));
      }
      this.filteredOptions = [...this.options];
    });
  }

  // Checks if a user exists in the project
  userExistsInProject(user: User): boolean {
    if (this.project === undefined) {
      return false;
    }
    return !!this.project.users.find(
      (projectUser) => projectUser.userID === user.userID
    );
  }

  // Filters the list of options based on input
  filter(): void {
    const filterValue = this.input.nativeElement.value.toLowerCase();
    this.filteredOptions = this.options.filter((option) => {
      return option.fullName.toLowerCase().includes(filterValue);
    });
  }

  // Saves the project to the server
  saveProject(form: NgForm) {
    if (!form.valid) {
      alert('Please fill out all required fields.');
      return;
    }

    if (this.projectDescription === undefined) {
      this.projectDescription = '';
    }

    const selectedUser = this.findSelectedUser();
    this.addProjectManagerToUsers();

    this.projectManagerDataService.getManagerID(selectedUser.userID).subscribe(
      (managerID) => {
        const projectData = {
          projectID: 0,
          projectName: this.projectName,
          projectDescription: this.projectDescription,
          projectEndDate: this.myDate,
          managerID: managerID,
          userIDs: this.checkedUsers.map((user) => ({
            userID: user.userID,
          })),
        };

        if (this.isEditMode === true) {
          projectData.projectID = this.project.projectID;
          this.updateProject(projectData);
        } else {
          this.createNewProject(projectData);
        }
      },
      (error) => {
        console.error('Error getting manager ID:', error);
        alert('An error occurred while retrieving the manager ID.');
      }
    );
  }

  // Finds the selected user
  findSelectedUser(): any {
    const selectedOption = this.myControl.value;
    const selectedUser = this.options.find(
      (option) => option.fullName === selectedOption
    );
    return selectedUser;
  }

  // Creates a new project
  createNewProject(data: any) {
    let project = {
      projectName: data.projectName,
      projectDescription: data.projectDescription,
      projectEndDate: data.projectEndDate,
      managerID: data.managerID,
    };

    this.projectDataService.createProject(project, data.userIDs).subscribe(
      (response: any) => {
        this.logDataService.addCreateProjectLog(
          response.projectID,
          project.projectName
        );
        this.router.navigate(['/dashboard']);
      },
      (error) => {
        console.error('Error creating project:', error);
        alert('An error occurred while creating the project.');
      }
    );
  }

  // Updates an existing project
  updateProject(data: any) {
    let project = {
      projectID: data.projectID,
      projectName: data.projectName,
      projectDescription: data.projectDescription,
      projectEndDate: data.projectEndDate,
      managerID: data.managerID,
    };
    this.projectDataService.updateProject(project, data.userIDs).subscribe(
      () => {
        this.logDataService.addUpdateProjectLog(
          project.projectID,
          project.projectName
        );
        this.router.navigate(['/dashboard']);
      },
      (error) => {
        console.error('Error updating project:', error);
        alert('An error occurred while updating the project.');
      }
    );
    this.router.navigate(['/dashboard']);
  }

  // Unsubscribes from observables to prevent memory leaks
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  // Toggles selection of a user
  toggleUserSelection(user: User) {
    const index = this.checkedUsers.findIndex(
      (checkedUser) => checkedUser.userID === user.userID
    );

    if (index !== -1) {
      this.checkedUsers.splice(index, 1);
    } else {
      this.checkedUsers.push(user);
    }
  }

  // Adds project manager to selected users if not already present
  addProjectManagerToUsers() {
    let selectedManager = this.findSelectedUser();
    const managerAlreadySelected = this.checkedUsers.find(
      (user) => user.userID === selectedManager.userID
    );

    if (!managerAlreadySelected) {
      this.checkedUsers.push(selectedManager);
    }
  }
}
