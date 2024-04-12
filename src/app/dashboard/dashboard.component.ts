import { Component } from '@angular/core';
import { UserService } from '../service/user.service';
import { LogService } from '../service/log.service';
import { UserDataService } from '../service/api/user-data.service';
import { ProjectManagerDataService } from '../service/api/project-manager-data.service';
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
  styleUrl: './dashboard.component.css',
})

//TODO: If Admin is logged in show all Projects or only Admin Projects
export class DashboardComponent {
  projects$: Observable<Project[]> = of([]); // Initialize with an empty observable array
  showProjects: boolean;
  selectedOption: string = "All Projects";

  constructor(
    private userService: UserService,
    private logService: LogService,
    private projectService: ProjectService,
    private managerDataService: ProjectManagerDataService,
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

  loadAllProjects() {
    this.projects$ = this.projectDataService.getAllProjects();
  }

  loadUserProjects() {
    this.projects$ = this.projectDataService.getProjectFromUser(
      this.userService.getCurrentUser().userID
    );
  }

  refreshProjects() {
    if (this.showProjects === true) {
      this.loadAllProjects();
    } else {
      this.loadUserProjects();
    }
  }

  editProject(project: Project) {
    this.projectService.isProjectEditMode = true;
    this.projectService.setSelectedProject(project);
  }

  createProject() {
    this.projectService.isProjectEditMode = false;
  }

  isAdmin(): boolean {
    return this.userService.isAdmin();
  }

  isNotUser(): boolean{
    return this.userService.currentUser.role !== Role.USER
  }

  deleteProject(project: Project) {
    this.projectDataService.deleteProject(project.projectID).subscribe(
      () => {
        //Log Entry
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

  navigateToAllProjects() {
    this.projectService.showAllProjects = true;
    this.selectedOption = "All Projects"
    this.loadAllProjects(); // Check if this method is being called
  }
  navigateToMyProjects() {
    this.projectService.showAllProjects = false;
    this.selectedOption = "My Projects"
    this.loadUserProjects(); // Check if this method is being called
  }

  openProjectLogs(project: Project) {
    this.logService.setIsProjectLog(true);
    this.projectService.setSelectedProject(project);
  }

  formateDate(date: Date): string {
    return this.niceDate.formatDate(date)
  }

  isAdminOrProjectManager(project: Project): any {
    const currentUser = this.userService.currentUser
    if(currentUser.role === Role.ADMIN || project.manager.userID === currentUser.userID){
      return true
    }
    return false;
  }
}
