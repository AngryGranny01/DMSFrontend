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
export class DashboardComponent {
createNewProject() {
throw new Error('Method not implemented.');
}
  projects$: Observable<Project[]> = of([]); // Initialize with an empty observable array

  constructor(
    private userService: UserService,
    private logService: LogService,
    private projectService: ProjectService,
    private managerDataService: ProjectManagerDataService,
    private logDataService: LogDataService,
    private projectDataService: ProjectDataService
  ) {}

  ngOnInit(): void {
    this.loadAllProjects();
  }

  loadAllProjects() {
    this.projects$ = this.projectDataService.getAllProjects();
  }

  refreshProjects() {
    this.loadAllProjects();
  }

  editProject(project: Project) {
    this.projectService.isProjectEditMode = true;
    this.projectService.setSelectedProject(project);
  }

  createProject(){
    this.projectService.isProjectEditMode = false;
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

  openProjectLogs(_t30: any) {
    throw new Error('Method not implemented.');
  }
}
