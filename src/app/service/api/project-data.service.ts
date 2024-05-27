import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { ApiConfigService } from './api-config.service';
import { Project } from '../../models/projectInterface';
import { User } from '../../models/userInterface';
import { Role } from '../../models/role';

@Injectable({
  providedIn: 'root',
})
export class ProjectDataService {
  constructor(private http: HttpClient, private apiConfig: ApiConfigService) {}

  //-------------------------------------------- Get-Requests --------------------------------------------------------------//

  /**
   * Retrieves all projects from the server.
   * @returns An Observable of an array of Project objects.
   */
  getAllProjects(): Observable<Project[]> {
    return this.http
      .get<any[]>(`${this.apiConfig.baseURL}/projects`)
      .pipe(
        map((response: any[]) =>
          response.map((project) => this.extractProject(project))
        )
      );
  }

  /**
   * Retrieves projects associated with a specific user from the server.
   * @param userID The ID of the user to retrieve projects for.
   * @returns An Observable of an array of Project objects.
   */
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

  /**
   * Creates a new project on the server.
   * @param project The project data to be created.
   * @param userIDs An array of user IDs associated with the project.
   * @returns An Observable of the HTTP response.
   */
  createProject(project: any, userIDs: any[]): Observable<any> {
    const unencryptedProject = {
      projectName: project.projectName,
      projectDescription: project.projectDescription,
      projectKey: project.projectKey,
      projectEndDate: project.projectEndDate,
      managerID: project.managerID,
      userIDs: userIDs,
    };

    return this.http.post(
      `${this.apiConfig.baseURL}/projects`,
      unencryptedProject
    );
  }

  //-------------------------------------------- Put-Requests --------------------------------------------------------------//

  /**
   * Updates an existing project on the server.
   * @param project The updated project data.
   * @param userIDs An array of updated user IDs associated with the project.
   * @returns An Observable of the HTTP response.
   */
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

  /**
   * Deletes a project from the server.
   * @param projectID The ID of the project to be deleted.
   * @returns An Observable of the HTTP response.
   */
  deleteProject(projectID: number) {
    return this.http.delete(
      `${this.apiConfig.baseURL}/projects?projectID=${projectID}`
    );
  }

  //-------------------------------------------- Helper Functions --------------------------------------------------------------//

  /**
   * Extracts project details from the response data.
   * @param project The project data to extract details from.
   * @returns A Project object.
   */
  private extractProject(project: any): Project {
    const users: User[] = [];
    const projectManager = project.manager[0];
    const manager = new User(
      projectManager.userID,
      projectManager.userName,
      projectManager.firstName,
      projectManager.lastName,
      '',
      Role.MANAGER,
      projectManager.email,
      projectManager.orgEinheit
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
          user.email,
          '',
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
