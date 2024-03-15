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

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})

//TODO: If Admin is logged in show all Projects or only Admin Projects
export class DashboardComponent {
  projects$: Observable<Project[]> = of([]); // Initialize with an empty observable array
  showAllProjects: boolean = false;
  constructor(
    private userService: UserService,
    private logService: LogService,
    private projectService: ProjectService,
    private managerDataService: ProjectManagerDataService,
    private logDataService: LogDataService,
    private projectDataService: ProjectDataService
  ) {}

  ngOnInit(): void {
    if(this.showAllProjects === true){
      this.loadAllProjects();
    }else{
      this.loadUserProjects();
    }
  }

  loadAllProjects() {
    this.projects$ = this.projectDataService.getAllProjects();
  }

  loadUserProjects(){
    this.projects$ = this.projectDataService.getProjectFromUser(this.userService.getCurrentUser().userID)
  }

  refreshProjects() {
    if(this.showAllProjects === true){
      this.loadAllProjects();
    }else{
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

  deleteProject(projectID: number) {
    this.projectDataService.deleteProject(projectID).subscribe(
      () => {
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
    this.showAllProjects = true;
  }
  navigateToMyProjects() {
    this.showAllProjects = false;
  }

  openProjectLogs(_t30: any) {
    throw new Error('Method not implemented.');
  }
}
