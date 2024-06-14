import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ApiConfigService } from './api-config.service';
import { Project } from '../../models/projectInterface';
import { User } from '../../models/userInterface';
import { Role } from '../../models/role';
import { LogDataService } from './log-data.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectDataService {
  constructor(private http: HttpClient, private apiConfig: ApiConfigService, private logDataService: LogDataService) {}

  // Get-Requests
  getAllProjects(): Observable<Project[]> {
    return this.http
      .get<any[]>(`${this.apiConfig.baseURL}/projects`)
      .pipe(
        map((response: any[]) => response.map(this.extractProject)),
        catchError((error) => {
          console.error('Failed to fetch projects:', error);
          throw new Error(('Failed to fetch projects'));
        })
      );
  }

  getProjectFromUser(userID: number): Observable<Project[]> {
    return this.http
      .get<any[]>(`${this.apiConfig.baseURL}/projects/${userID}`)
      .pipe(
        map((response: any[]) => response.map(this.extractProject)),
        catchError((error) => {
          console.error('Failed to fetch projects for user:', error);
          this.logDataService.addErrorUserLog(`Failed to fetch projects for user: ${userID}`);
          throw new Error(('Failed to fetch projects for user'));
        })
      );
  }


  // Post-Requests
  createProject(project: any, userIDs: any[]): Observable<any> {
    const newProject = {
      projectName: project.projectName,
      projectDescription: project.projectDescription,
      projectKey: project.projectKey,
      projectEndDate: project.projectEndDate,
      managerID: project.managerID,
      userIDs: userIDs,
    };
    return this.http.post(`${this.apiConfig.baseURL}/projects`, newProject);
  }

  // Put-Requests
  updateProject(project: any, userIDs: any[]): Observable<any> {
    const updatedProject = {
      projectID: project.projectID,
      managerID: project.managerID,
      projectName: project.projectName,
      projectDescription: project.projectDescription,
      projectKey: project.projectKey,
      projectEndDate: project.projectEndDate,
      userIDs: userIDs,
    };
    return this.http.put(`${this.apiConfig.baseURL}/projects`, updatedProject);
  }

  // Delete-Requests
  deleteProject(projectID: number): Observable<any> {
    return this.http.delete(
      `${this.apiConfig.baseURL}/projects?projectID=${projectID}`
    );
  }

  // Helper Functions
  private extractProject(project: any): Project {
    const managerData = project.manager[0];
    const manager = new User(
      managerData.userID,
      managerData.userName,
      managerData.firstName,
      managerData.lastName,
      '',
      Role.MANAGER,
      managerData.email,
      managerData.orgEinheit
    );

    const users = project.users.map(
      (user: any) =>
        new User(
          user.userID,
          user.userName,
          user.firstName,
          user.lastName,
          '',
          user.role === Role.ADMIN
            ? Role.ADMIN
            : user.role === Role.MANAGER
            ? Role.MANAGER
            : Role.USER,
          user.email,
          user.orgEinheit
        )
    );

    return new Project(
      project.projectID,
      project.projectName,
      project.managerID,
      manager,
      users,
      project.projectDescription,
      new Date(project.projectEndDate)
    );
  }
}
