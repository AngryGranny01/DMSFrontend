import { Component, OnInit } from '@angular/core';
import { UserService } from '../service/user.service';
import { LogService } from '../service/log.service';
import { LogDataService } from '../service/api/log-data.service';
import { Observable, of } from 'rxjs';
import { ProjectDataService } from '../service/api/project-data.service';
import { Project } from '../models/projectInterface';
import { ProjectService } from '../service/project.service';
import { NiceDateService } from '../service/nice-date.service';
import { Role } from '../models/roleEnum';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  projects$: Observable<Project[]> = of([]); // Initialize with an empty observable array
  showProjects: boolean;
  selectedOption: string = 'My Projects';

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
    this.loadUserProjects();
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

  isNotUser(): boolean {
    return this.userService.currentUser.role !== Role.USER;
  }

  deleteProject(project: Project) {
    const confirmDelete = confirm(
      'Sind Sie sicher, dass Sie das Projekt löschen wollen'
    );
    if (!confirmDelete) {
      return;
    }
    this.projectDataService.deleteProject(project.projectID).subscribe(
      () => {
        this.logDataService.addDeleteProjectLog(project);
        this.refreshProjects();
      },
      (error) => {
        console.error('Error deleting Project:', error);
        this.logDataService.addErrorProjectLog(
          project.projectID,
          `Failed to update project with ID: ${project.projectID}`
        );
        throw new Error(`Failed to update project`);
      }
    );
  }

  navigateToAllProjects() {
    this.projectService.showAllProjects = true;
    this.selectedOption = 'All Projects';
    this.loadAllProjects();
  }

  navigateToMyProjects() {
    this.projectService.showAllProjects = false;
    this.selectedOption = 'My Projects';
    this.loadUserProjects();
  }

  openProjectLogs(project: Project) {
    this.logService.setIsProjectLog(true);
    this.projectService.setSelectedProject(project);
  }

  formatDate(date: Date | null): string {
    if (date === null) {
      return 'Open Ended';
    }
    return this.niceDate.formatDate(date);
  }

  isAdminOrProjectManager(project: Project): any {
    const currentUser = this.userService.currentUser;
    return (
      currentUser.role === Role.ADMIN ||
      project.manager.userID === currentUser.userID
    );
  }
}
