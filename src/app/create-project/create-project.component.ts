import { Component, ElementRef, ViewChild, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject, of } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';

import { Project } from '../models/projectInterface';
import { User } from '../models/userInterface';
import { Role } from '../models/role';

import { ProjectService } from '../service/project.service';
import { UserDataService } from '../service/api/user-data.service';
import { UserService } from '../service/user.service';
import { ProjectManagerDataService } from '../service/api/project-manager-data.service';
import { ProjectDataService } from '../service/api/project-data.service';
import { LogDataService } from '../service/api/log-data.service';
import { EncryptionService } from '../service/encryption.service';
import { DashboardComponent } from '../dashboard/dashboard.component';

@Component({
  selector: 'app-create-project',
  templateUrl: './create-project.component.html',
  styleUrls: ['./create-project.component.css'],
  providers: [DashboardComponent],
})
export class CreateProjectComponent implements OnInit, OnDestroy {
  @ViewChild('input') input!: ElementRef<HTMLInputElement>;
  myControl = new FormControl('');
  options: { fullName: string; userID: number }[] = [];
  filteredOptions: { fullName: string; userID: number }[] = [];

  projectName: string = '';
  projectDescription: string = '';
  myDate: Date = new Date();
  minDate: Date = new Date();
  maxDate: Date = new Date(new Date().getFullYear() + 5, new Date().getMonth(), new Date().getDate());

  isEditMode: boolean = false;
  project!: Project;
  users$: Observable<User[]> = of([]);
  checkedUsers: User[] = [];
  selectedManager: { fullName: string; userID: number } = { fullName: '', userID: 0 };

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
  ) {}

  ngOnInit() {
    this.isEditMode = this.projectService.isProjectEditMode;
    this.isEditMode ? this.initializeEditProject() : this.initializeNewProject();
    this.loadAllUsers();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private initializeEditProject() {
    this.project = this.projectService.getSelectedProject();
    this.projectName = this.project.name;
    this.projectDescription = this.project.description;
    this.myDate = new Date(this.project.endDate);
    this.maxDate = new Date(this.myDate.getFullYear() + 5, this.myDate.getMonth(), this.myDate.getDate());
    this.selectedManager = {
      fullName: this.userService.concatenateFirstnameLastname(
        this.project.manager.firstName,
        this.project.manager.lastName
      ) + ' (' + this.project.manager.orgEinheit + ')',
      userID: this.project.manager.userID
    };
    this.myControl.setValue(this.selectedManager.fullName);
    this.checkedUsers = this.project.users;
  }

  private initializeNewProject() {
    this.maxDate = new Date(new Date().getFullYear() + 5, new Date().getMonth(), new Date().getDate());
  }

  private loadAllUsers() {
    this.users$ = this.userDataService.getAllUsers();
    this.users$.pipe(takeUntil(this.unsubscribe$)).subscribe(users => {
      this.options = users
        .filter(user => user.role === Role.ADMIN || user.role === Role.MANAGER)
        .map(user => ({
          fullName: `${user.firstName} ${user.lastName} (${user.orgEinheit})`,
          userID: user.userID,
        }));
      this.filteredOptions = [...this.options];
    });
  }

  private findSelectedUser() {
    const selectedOption = this.myControl.value;
    return this.options.find(option => option.fullName === selectedOption);
  }

  private createProjectData(managerID: number, projectKey: string) {
    return {
      projectID: this.isEditMode ? this.project.projectID : 0,
      projectName: this.projectName,
      projectDescription: this.projectDescription,
      projectKey: projectKey,
      projectEndDate: this.myDate,
      managerID: managerID,
      userIDs: this.checkedUsers.map(user => user.userID)
    };
  }

  private addProjectManagerToCheckedUsers(manager: { fullName: string; userID: number }) {
    this.users$.pipe(
      takeUntil(this.unsubscribe$),
      map(users => users.find(user => user.userID === manager.userID))
    ).subscribe((selectedManagerUser: User | undefined) => {
      if (selectedManagerUser && !this.checkedUsers.some(user => user.userID === manager.userID)) {
        this.checkedUsers.push(selectedManagerUser);
      }
    });
  }

  private mapToProject(data: any) {
    return {
      projectID: data.projectID,
      projectName: data.projectName,
      projectDescription: data.projectDescription,
      projectKey: data.projectKey,
      projectEndDate: data.projectEndDate,
      managerID: data.managerID,
    };
  }

  filterOptions() {
    const filterValue = this.input.nativeElement.value.toLowerCase();
    this.filteredOptions = this.options.filter(option => option.fullName.toLowerCase().includes(filterValue));
  }

  saveProject() {
    const selectedManager = this.findSelectedUser();
    if (!selectedManager) {
      alert('No Project Manager Selected');
      return;
    }

    this.addProjectManagerToCheckedUsers(selectedManager);

    this.projectManagerDataService.getManagerAndAdminPassword(selectedManager.userID).subscribe(
      response => {
        const projectKey = this.encryptionService.generateProjectKey(response.adminPasswordHash, response.managerPasswordHash);
        const projectData = this.createProjectData(response.managerID, projectKey);

        this.isEditMode ? this.updateProject(projectData) : this.createNewProject(projectData);
      },
      error => {
        console.error('Error fetching managerID:', error);
      }
    );
  }

  private createNewProject(data: any) {
    const project = this.mapToProject(data);
    this.projectDataService.createProject(project, data.userIDs).subscribe(
      response => {
        this.logDataService.addCreateProjectLog(response.projectID, project.projectName);
        this.router.navigate(['/dashboard']);
      },
      error => {
        console.error('Error creating project:', error);
      }
    );
  }

  private updateProject(data: any) {
    const project = this.mapToProject(data);
    this.projectDataService.updateProject(project, data.userIDs).subscribe(
      () => {
        this.logDataService.addUpdateProjectLog(project.projectID, project.projectName);
        this.router.navigate(['/dashboard']);
      },
      error => {
        console.error('Error updating project:', error);
      }
    );
  }

  toggleUserSelection(user: User) {
    const index = this.checkedUsers.findIndex(checkedUser => checkedUser.userID === user.userID);
    index !== -1 ? this.checkedUsers.splice(index, 1) : this.checkedUsers.push(user);
  }

  userExistsInProject(user: User): boolean {
    if (this.project === undefined) {
      return false;
    }
    return !!this.project.users.find(projectUser => projectUser.userID === user.userID);
  }
}
