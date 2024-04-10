import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiConfigService } from './api-config.service';
import { Observable, map } from 'rxjs';
import { Project } from '../../models/projectInterface';
import { User } from '../../models/userInterface';
import { Role } from '../../models/role';
import { NiceDate } from '../../models/niceDateInterface';
import { EncryptionService } from '../encryption.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectDataService {
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
    private encryptionService: EncryptionService
  ) {}

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

  //All Projects by userID
  getProjectFromUser(userID: number): Observable<Project[]> {
    return this.http
      .get<any[]>(`${this.apiConfig.baseURL}/projects/${userID}`)
      .pipe(
        map((response: any[]) =>
          response.map((project) => this.extractProject(project))
        )
      );
  }


  //-------------------------------------------- Post-Requests --------------------------------------------------------------//
  createProject(
    project: any,
    userIDs: any[]
  ): Observable<any> {
    // Encrypt sensitive project data before sending it to the server
/*     const encryptedProject = this.encryptionService.encryptProjectData(
      project,
      userIDs,
      project.projectKey
    ); */
    const unencryptedProject = {
      projectName: project.projectName,
      projectDescription: project.projectDescription,
      projectKey: project.projectKey,
      projectEndDate: project.projectEndDate,
      managerID: project.managerID,
      userIDs: userIDs,
    };
    // Send the encrypted project data and user IDs to the server
    return this.http.post(
      `${this.apiConfig.baseURL}/projects`,
      unencryptedProject
    );
  }

  //-------------------------------------------- Put-Requests --------------------------------------------------------------//
  updateProject(project: any, userIDs: any[]) {
    const updateProject = {
      projectID: project.projectID,
      managerID: project.managerID,
      projectName: project.projectName,
      projectDescription: project.projectDescription,
      projectKey: project.projectKey,
      projectEndDate: project.projectEndDate,
      userIDs: userIDs,
    };
    return this.http.put(`${this.apiConfig.baseURL}/projects`, updateProject);
  }

  //-------------------------------------------- Delete-Requests --------------------------------------------------------------//
  deleteProject(projectID: number) {
    return this.http.delete(
      `${this.apiConfig.baseURL}/projects?projectID=${projectID}`
    );
  }

  extractProject(project: any): Project {

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
      projectManager.orgEinheit,
      ''
    );

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
          '',
          ''
        )
      );
    }
    return new Project(
      project.projectID,
      project.projectName,
      project.managerID,
      manager,
      users,
      project.description,
      project.key,
      new Date(project.endDate)
    );
  }
}
