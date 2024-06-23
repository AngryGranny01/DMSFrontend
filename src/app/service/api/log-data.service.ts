import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';

import { User } from '../../models/userInterface';
import { Project } from '../../models/projectInterface';
import { Log } from '../../models/logInterface';
import { ActivityName } from '../../models/activityName';
import { LogDescriptionValues } from '../../models/logDescriptionValues';

import { ApiConfigService } from './api-config.service';
import { LogService } from '../log.service';
import { UserService } from '../user.service';

@Injectable({
  providedIn: 'root',
})
export class LogDataService {
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
    private logService: LogService,
    private userService: UserService
  ) {}

  /**
   * Retrieves user logs for the specified user ID.
   * @param userID The ID of the user whose logs are to be retrieved.
   * @returns An Observable of Log array.
   */
  getUserLogs(userID: number): Observable<Log[]> {
    return this.http.get<any[]>(`${this.apiConfig.baseURL}/logs/user/${userID}`)
      .pipe(
        map(response => response.map(log => this.extractLogs(log))),
        catchError((error) => {
          console.error('Failed to fetch user logs:', error);
          throw new Error('Failed to fetch user logs');
        })
      );
  }

  /**
   * Retrieves project logs for the specified project ID and current user.
   * @param projectID The ID of the project whose logs are to be retrieved.
   * @param currentUser The current user accessing the logs.
   * @returns An Observable of Log array.
   */
  getProjectLogs(projectID: number): Observable<Log[]> {
    return this.http.get<any[]>(`${this.apiConfig.baseURL}/logs/project/${projectID}`)
      .pipe(
        map(response => response.map(log => this.extractLogs(log))),
        catchError((error) => {
          console.error('Failed to fetch project logs:', error);
          throw new Error('Failed to fetch project logs');
        })
      );
  }

  /**
   * Creates a user log entry.
   * @param log The log data to be created.
   * @returns An Observable of the HTTP response.
   */
  private createUserLog(log: any): Observable<any> {
    const data = {
      userID: log.userID,
      activityName: log.activityName,
      activityDescription: log.description,
    };
    return this.http.post(`${this.apiConfig.baseURL}/logs`, data)
      .pipe(
        catchError((error) => {
          console.error('Failed to create user log:', error);
          throw new Error('Failed to create user log');
        })
      );
  }
  /**
   * Creates a project log entry.
   * @param log The log data to be created.
   * @returns An Observable of the HTTP response.
   */
  private createProjectLog(log: any): Observable<any> {
    const data = {
      projectID: log.projectID,
      userID: log.userID,
      activityName: log.activityName,
      activityDescription: log.description,
    };
    return this.http.post(`${this.apiConfig.baseURL}/logs`, data)
      .pipe(
        catchError((error) => {
          console.error('Failed to create project log:', error);
          throw new Error('Failed to create project log');
        })
      );
  }

  /**
   * Extracts log data.
   * @param logData The encrypted log data to be decrypted.
   * @returns A Log object.
   */
  private extractLogs(logData: any): Log {
    const timeStamp = new Date(logData.timeStamp);

    return {
      logID: parseInt(logData.logID),
      userID: parseInt(logData.userID),
      firstName: logData.firstName,
      lastName: logData.lastName,
      activityName: this.logService.matchActivityNameWithString(logData.activityName),
      description: logData.activityDescription,
      dateTime: timeStamp,
    };
  }

  //-------------------------------------------- User Logs --------------------------------------------------------------//
  addLoginLog() {
    const log = {
      description: LogDescriptionValues.createLogDescription(
        ActivityName.LOGIN,
        this.userService.getCurrentUserID(),
        this.userService.getCurrentUsername()
      ),
      activityName: ActivityName.LOGIN,
      userID: this.userService.getCurrentUserID(),
    };

    this.createUserLog(log).subscribe(
      () => console.log('Login logged successfully'),
      (error) => console.error('Error logging login:', error)
    );
  }

  addLogoutLog() {
    const log = {
      description: LogDescriptionValues.createLogDescription(
        ActivityName.LOGOUT,
        this.userService.getCurrentUserID(),
        this.userService.getCurrentUsername()
      ),
      activityName: ActivityName.LOGOUT,
      userID: this.userService.getCurrentUserID(),
    };

    this.createUserLog(log).subscribe(
      () => console.log('Logout logged successfully'),
      (error) => console.error('Error logging logout:', error)
    );
  }

  addCreateUserLog(userID: number, username: string) {
    const log = {
      description: LogDescriptionValues.createLogDescription(
        ActivityName.CREATE_USER,
        userID,
        username
      ),
      activityName: ActivityName.CREATE_USER,
      userID: userID,
    };
    this.createUserLog(log).subscribe(
      () => console.log('User created logged successfully'),
      (error) => console.error('Error logging user created:', error)
    );
  }

  addUpdateUserLog(user: User) {
    const log = {
      description: LogDescriptionValues.createLogDescription(
        ActivityName.UPDATE_USER,
        user.userID,
        user.userName
      ),
      activityName: ActivityName.UPDATE_USER,
      userID: this.userService.getCurrentUserID(),
    };

    this.createUserLog(log).subscribe(
      () => console.log('User update logged successfully'),
      (error) => console.error('Error logging user update:', error)
    );
  }

  addDeleteUserLog(user: User) {
    const log = {
      description: LogDescriptionValues.createLogDescription(
        ActivityName.DELETE_USER,
        user.userID,
        user.userName
      ),
      activityName: ActivityName.DELETE_USER,
      userID: this.userService.getCurrentUserID(),
    };

    this.createUserLog(log).subscribe(
      () => console.log('User deletion logged successfully'),
      (error) => console.error('Error logging user deletion:', error)
    );
  }

  //-------------------------------------------- Project Logs --------------------------------------------------------------//
  addCreateProjectLog(projectID: number, projectName: string) {
    const log = {
      description: LogDescriptionValues.createLogDescription(
        ActivityName.CREATE_PROJECT,
        '',
        '',
        projectName,
        projectID
      ),
      activityName: ActivityName.CREATE_PROJECT,
      userID: this.userService.getCurrentUserID(),
      projectID: projectID,
    };

    this.createProjectLog(log).subscribe(
      () => console.log('Project created logged successfully'),
      (error) => console.error('Error logging Project created:', error)
    );
  }

  addUpdateProjectLog(projectID: number, projectName: string) {
    const log = {
      description: LogDescriptionValues.createLogDescription(
        ActivityName.UPDATE_PROJECT,
        '',
        '',
        projectName,
        projectID
      ),
      activityName: ActivityName.UPDATE_PROJECT,
      userID: this.userService.getCurrentUserID(),
      projectID: projectID,
    };

    this.createProjectLog(log).subscribe(
      () => console.log('Project update logged successfully'),
      (error) => console.error('Error logging project update:', error)
    );
  }

  addDeleteProjectLog(project: Project) {
    const log = {
      description: LogDescriptionValues.createLogDescription(
        ActivityName.DELETE_PROJECT,
        '',
        '',
        project.name,
        project.projectID
      ),
      activityName: ActivityName.DELETE_PROJECT,
      userID: this.userService.getCurrentUserID(),
      projectID: project.projectID,
    };

    this.createUserLog(log).subscribe(
      () => console.log('Project deletion logged successfully'),
      (error) => console.error('Error logging project deletion:', error)
    );
  }

  //-------------------------------------------- Error Logs --------------------------------------------------------------//
  addErrorUserLog(errorMessage: string) {
    const log = {
      description: LogDescriptionValues.createLogDescription(
        ActivityName.ERROR,"","","","","","","",
        errorMessage
      ),
      activityName: ActivityName.ERROR,
      userID: this.userService.getCurrentUserID(),
    };

    this.createUserLog(log).subscribe(
      () => console.log('User Error logged successfully'),
      (error) => console.error('Error logging user error:', error)
    );
  }

  addErrorProjectLog(projectID: number, errorMessage: string) {
    const log = {
      description: LogDescriptionValues.createLogDescription(
        ActivityName.ERROR,"","","","","","","",
        errorMessage
      ),
      activityName: ActivityName.ERROR,
      userID: this.userService.getCurrentUserID(),
      projectID: projectID,
    };

    this.createProjectLog(log).subscribe(
      () => console.log('Project Error logged successfully'),
      (error) => console.error('Error logging project error:', error)
    );
  }
}
