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
import { Role } from '../models/roleEnum';
import { ProjectService } from '../service/project.service';
import { UserDataService } from '../service/api/user-data.service';
import { UserService } from '../service/user.service';
import { ProjectManagerDataService } from '../service/api/project-manager-data.service';
import { Router } from '@angular/router';
import { ProjectDataService } from '../service/api/project-data.service';
import { LogDataService } from '../service/api/log-data.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-create-project',
  templateUrl: './create-project.component.html',
  styleUrls: ['./create-project.component.css'],
})
export class CreateProjectComponent implements OnInit, OnDestroy {
  @ViewChild('input') input!: ElementRef<HTMLInputElement>;
  myControl = new FormControl('');
  options: { fullName: string; userID: number }[] = [];
  filteredOptions: { fullName: string; userID: number }[] = [];

  startDateControl = new FormControl();
  project!: Project;

  myDate: Date | null = null;
  minDate: Date = new Date();
  maxDate!: Date;

  isEditMode: boolean = false;
  users$: Observable<User[]> = of([]);
  checkedUsers: User[] = [];
  selectedManager: { fullName: string; userID: number } = {
    fullName: '',
    userID: 0,
  };

  oldUsers: User[] = [];
  projectName: any;
  projectDescription: any;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private projectService: ProjectService,
    private userDataService: UserDataService,
    private userService: UserService,
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
      this.oldUsers = this.project.users.map(user => ({ ...user })); // Create a deep copy of the users array
      this.setInputFieldsForEditProject();
    } else {
      this.isEditMode = false;
      this.setInputFieldsForNewProject();
    }
    this.loadAllUsers();
  }

  setInputFieldsForEditProject() {
    this.projectName = this.project.name;
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
    console.log(this.oldUsers)

    if (this.project.endDate !== null) {
      this.myDate = new Date(this.project.endDate);
    }
    this.maxDate = new Date(
      this.myDate
        ? this.myDate.getFullYear() + 5
        : new Date().getFullYear() + 5,
      this.myDate ? this.myDate.getMonth() : new Date().getMonth(),
      this.myDate ? this.myDate.getDate() : new Date().getDate()
    );
    this.projectDescription = this.project.description;
    this.checkedUsers = this.project.users;
  }

  setInputFieldsForNewProject() {
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
      if (this.userService.currentUser.role === Role.PROJECT_MANAGER) {
        const currentUser = this.userService.currentUser;
        this.options = [
          {
            fullName: `${currentUser.firstName} ${currentUser.lastName} (${currentUser.orgUnit})`,
            userID: currentUser.userID,
          },
        ];
      } else {
        this.options = users
          .filter(
            (user) =>
              user.role === Role.ADMIN || user.role === Role.PROJECT_MANAGER
          )
          .map((user) => ({
            fullName: `${user.firstName} ${user.lastName} (${user.orgUnit})`,
            userID: user.userID,
          }));
      }
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

  saveProject(form: NgForm) {
    if (!form.valid) {
      alert('Please fill out all required fields.');
      return;
    }

    if (
      this.projectDescription === undefined ||
      this.projectDescription === ''
    ) {
      this.projectDescription = null;
    }

    const selectedUser = this.findSelectedUser();
    if (!selectedUser) {
      alert('Please select a valid project manager.');
      return;
    }

    const projectData = {
      projectID: this.isEditMode ? this.project.projectID : 0,
      projectName: this.projectName,
      projectDescription: this.projectDescription,
      projectEndDate: this.myDate
        ? this.myDate.toISOString().split('T')[0]
        : null,
      managerID: selectedUser.userID,
      userIDs: this.checkedUsers
        .filter((user) => user.userID !== selectedUser.userID) // Exclude project manager from user IDs
        .map((user) => ({ userID: user.userID })),
    };
    console.log(projectData);
    if (this.isEditMode) {
      this.updateProject(projectData);
    } else {
      this.createNewProject(projectData);
    }
  }

  findSelectedUser(): any {
    const selectedOption = this.myControl.value;
    const selectedUser = this.options.find(
      (option) => option.fullName === selectedOption
    );
    return selectedUser;
  }

  createNewProject(data: any) {
    let project = {
      projectName: data.projectName,
      projectDescription: data.projectDescription,
      projectEndDate: data.projectEndDate,
      managerID: data.managerID,
      userIDs: data.userIDs
    };

    this.projectDataService.createProject(project).subscribe(
      (response: any) => {
        this.logNewProject(project,response.projectID);
        this.router.navigate(['/dashboard']);
      },
      (error) => {
        console.error('Error creating project:', error);
        alert('An error occurred while creating the project.');
      }
    );
  }

  updateProject(data: any) {
    let updatedProject = {
      projectID: data.projectID,
      projectName: data.projectName,
      projectDescription: data.projectDescription,
      projectEndDate: data.projectEndDate,
      managerID: data.managerID,
      userIDs: data.userIDs,
    };
    const oldProject = this.project;
    console.log(oldProject);
    console.log(data.userIDs);
    this.projectDataService.updateProject(updatedProject).subscribe(
      () => {
        this.logChanges(oldProject, updatedProject, this.oldUsers);
        this.router.navigate(['/dashboard']);
      },
      (error) => {
        console.error('Error updating project:', error);
        alert('An error occurred while updating the project.');
      }
    );
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
      this.checkedUsers.splice(index, 1);
    } else {
      this.checkedUsers.push(user);
    }
  }

  logNewProject(newProject: any, newProjectID: any) {
    console.log("Log New Project")
    this.logDataService.addCreateProjectLog(
      newProjectID,
      'Name',
      newProject.projectName
    );
    this.logDataService.addCreateProjectLog(
      newProjectID,
      'Description',
      newProject.projectDescription || "empty"
    );
    this.logDataService.addCreateProjectLog(
      newProjectID,
      'End Date',
      newProject.projectEndDate || "open Ended"
    );
    this.logDataService.addCreateProjectLog(
      newProjectID,
      'ManagerID',
      newProject.managerID
    );

    if (newProject.userIDs.length > 0) {
      const userIdsString = newProject.userIDs.map((user: any) => user.userID).join(', ');
      this.logDataService.addCreateProjectLog(
        newProjectID,
        'Added UserIDs',
        userIdsString
      );
    }
  }

  logChanges(oldProject: Project, newProject: any, oldUsers: User[]) {
    if (oldProject.name !== newProject.projectName) {
      this.logDataService.addUpdateProjectLog(
        oldProject.projectID,
        'Name',
        newProject.projectName
      );
    }
    if (oldProject.description !== newProject.projectDescription) {
      this.logDataService.addUpdateProjectLog(
        oldProject.projectID,
        'Description',
        newProject.projectDescription || "empty"
      );
    }
    if (oldProject.endDate !== newProject.projectEndDate) {
      this.logDataService.addUpdateProjectLog(
        oldProject.projectID,
        'End Date',
        newProject.projectEndDate || "open Ended"
      );
    }
    if (oldProject.manager.userID !== newProject.managerID) {
      this.logDataService.addUpdateProjectLog(
        oldProject.projectID,
        'ManagerID',
        newProject.managerID
      );
    }

    // Ensure the user IDs are compared correctly
    console.log(newProject.userIDs)
    console.log(oldUsers)
    const oldUserIDs = oldUsers
      .map((user) => user.userID)
      .sort((a, b) => a - b);
    const newUserIDs = newProject.userIDs
      .map((user: any) => user.userID)
      .sort((a: number, b: number) => a - b);
    console.log(oldUserIDs);
    console.log(newUserIDs);
    const addedUserIDs = newUserIDs.filter(
      (id: number) => !oldUserIDs.includes(id)
    );
    const removedUserIDs = oldUserIDs.filter(
      (id: number) => !newUserIDs.includes(id)
    );

    if (addedUserIDs.length > 0) {
      this.logDataService.addUpdateProjectLog(
        oldProject.projectID,
        'Added UserIDs',
        addedUserIDs.join(', ')
      );
    }

    if (removedUserIDs.length > 0) {
      this.logDataService.addUpdateProjectLog(
        oldProject.projectID,
        'Removed UserIDs',
        removedUserIDs.join(', ')
      );
    }
  }
}
