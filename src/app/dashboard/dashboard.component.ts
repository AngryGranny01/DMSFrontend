import { Component, OnInit } from '@angular/core';
import { UserService } from '../service/user.service';
import { LogService } from '../service/log.service';
import { LogDataService } from '../service/api/log-data.service';
import { Observable, of } from 'rxjs';
import { ProjectDataService } from '../service/api/project-data.service';
import { Project } from '../models/projectInterface';
import { ProjectService } from '../service/project.service';
import { NiceDateService } from '../service/nice-date.service';
import { Role } from '../models/role';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  projects$: Observable<Project[]> = of([]); // Initialize with an empty observable array
  showProjects: boolean;
  selectedOption: string = 'All Projects';

  constructor(
    private userService: UserService,
    private logService: LogService,
    private projectService: ProjectService,
    private logDataService: LogDataService,
    private projectDataService: ProjectDataService,
    private niceDate: NiceDateService
  ) {
    this.showProjects = projectService.showAllProjects;
  }

  ngOnInit(): void {
    if (this.showProjects === true) {
      this.loadAllProjects();
    } else {
      this.loadUserProjects();
    }
  }

  // Loads all projects
  loadAllProjects() {
    this.projects$ = this.projectDataService.getAllProjects();
  }

  // Loads projects specific to the current user
  loadUserProjects() {
    this.projects$ = this.projectDataService.getProjectFromUser(
      this.userService.getCurrentUser().userID
    );
  }

  // Refreshes the list of projects
  refreshProjects() {
    if (this.showProjects === true) {
      this.loadAllProjects();
    } else {
      this.loadUserProjects();
    }
  }

  // Sets project to edit mode and selects the project to edit
  editProject(project: Project) {
    this.projectService.isProjectEditMode = true;
    this.projectService.setSelectedProject(project);
  }

  // Sets project to create mode
  createProject() {
    this.projectService.isProjectEditMode = false;
  }

  // Checks if the current user is an admin
  isAdmin(): boolean {
    return this.userService.isAdmin();
  }

  // Checks if the current user is not a regular user
  isNotUser(): boolean {
    return this.userService.currentUser.role !== Role.USER;
  }

  // Deletes a project
  deleteProject(project: Project) {
    this.projectDataService.deleteProject(project.projectID).subscribe(
      () => {
        // Log Entry
        this.logDataService.addDeleteProjectLog(project);

        // Refresh Project data after successful deletion
        this.refreshProjects();
      },
      (error) => {
        // Handle error deleting Project
        console.error('Error deleting Project:', error);
        // Optionally, notify the user about the error
      }
    );
  }

  // Navigates to view all projects
  navigateToAllProjects() {
    this.projectService.showAllProjects = true;
    this.selectedOption = 'All Projects';
    this.loadAllProjects();
  }

  // Navigates to view projects specific to the current user
  navigateToMyProjects() {
    this.projectService.showAllProjects = false;
    this.selectedOption = 'My Projects';
    this.loadUserProjects();
  }

  // Opens project logs
  openProjectLogs(project: Project) {
    this.logService.setIsProjectLog(true);
    this.projectService.setSelectedProject(project);
  }

  // Formats date
  formateDate(date: Date): string {
    return this.niceDate.formatDate(date);
  }

  // Checks if the current user is an admin or project manager of the project
  isAdminOrProjectManager(project: Project): any {
    const currentUser = this.userService.currentUser;
    if (
      currentUser.role === Role.ADMIN ||
      project.manager.userID === currentUser.userID
    ) {
      return true;
    }
    return false;
  }
}
