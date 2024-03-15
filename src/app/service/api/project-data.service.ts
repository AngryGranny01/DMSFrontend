import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiConfigService } from './api-config.service';
import { Observable, map } from 'rxjs';
import { Project } from '../../models/projectInterface';
import { User } from '../../models/userInterface';
import { Role } from '../../models/role';
import { NiceDate } from '../../models/niceDateInterface';

@Injectable({
  providedIn: 'root',
})
export class ProjectDataService {
  constructor(private http: HttpClient, private apiConfig: ApiConfigService) {}

  //-------------------------------------------- Get-Requests --------------------------------------------------------------//
  getAllProjects(): Observable<Project[]> {
    return this.http
      .get<any[]>(`${this.apiConfig.baseURL}/projects`)
      .pipe(
        map((response: any[]) =>
          response.map((project) => this.extractProject(project))
        )
      );
  }

  //specific Project by userID
  getProjectFromUser(userID: number): Observable<Project> {
    return this.http
      .get(`${this.apiConfig.baseURL}/projects?userID=${userID}`)
      .pipe(
        map((response: any) => {
          return this.extractProject(response);
        })
      );
  }

  //specific Project by projectID
  getProject(projectID: number): Observable<Project> {
    return this.http
      .get(`${this.apiConfig.baseURL}/projects/${projectID}`)
      .pipe(
        map((response: any) => {
          return this.extractProject(response);
        })
      );
  }

  //-------------------------------------------- Post-Requests --------------------------------------------------------------//
  createProject(project: Project) {
    const createProject = {
      managerID: project.managerID,
      projectName: project.name,
      projectDescription: project.description,
      projectKey: project.key,
      projectEndDate: project.endDate,
      //userIDs: project.users.userId,
    };
    return this.http.post(`${this.apiConfig.baseURL}/projects`, createProject);
  }

  //-------------------------------------------- Put-Requests --------------------------------------------------------------//
  updateProject(project: Project) {
    const updateProject = {
      projectID: project.projectID,
      projectName: project.name,
      projectDescription: project.description,
      projectKey: project.key,
      projectEndDate: project.endDate,
      managerID: project.managerID,
      //userIDs: project.users.userId,
    };
    console.log(updateProject);
    return this.http.put(`${this.apiConfig.baseURL}/projects`, updateProject);
  }

  //-------------------------------------------- Delete-Requests --------------------------------------------------------------//
  deleteProject(projectID: number) {
    return this.http.delete(
      `${this.apiConfig.baseURL}/projects?projectID=${projectID}`
    );
  }

  extractProject(project: any) {
    const users: User[] = [];
    const projectManager = project.manager[0];
    const manager = new User(
      projectManager.userID,
      projectManager.userName,
      projectManager.firstName,
      projectManager.lastName,
      '',
      Role.MANAGER,
      '',
      new NiceDate(0, 0, 0, 0, 0)
    )

    for (const user of project.users) {
      const role =
      user.role === Role.ADMIN
        ? Role.ADMIN
        : user.role === Role.MANAGER
        ? Role.MANAGER
        : Role.USER;

      users.push(
        new User(
          user.userID,
          user.userName,
          user.firstName,
          user.lastName,
          '',
          role,
          '',
          new NiceDate(0, 0, 0, 0, 0)
        )
      );
    }

    const endDate = new NiceDate(
      project.endDate.year,
      project.endDate.month,
      project.endDate.day,
      project.endDate.hour,
      project.endDate.minutes
    );


    return new Project(
      project.projectID,
      project.projectName,
      project.managerID,
      manager,
      users,
      project.description,
      project.key,
      endDate
    );
  }
}
