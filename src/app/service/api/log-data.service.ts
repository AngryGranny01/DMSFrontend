import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';

import { User } from '../../models/userInterface';
import { Project } from '../../models/projectInterface';
import { Log } from '../../models/logInterface';
import { LogDescriptionValues } from '../../models/logDescriptionValues';

import { ApiConfigService } from './api-config.service';
import { LogService } from '../log.service';
import { UserService } from '../user.service';
import { Action } from '../../models/logActionEnum';
import { Target } from '../../models/logTargetEnum';

@Injectable({
  providedIn: 'root',
})
export class LogDataService {
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
    private userService: UserService
  ) {}

  /**
   * Retrieves user logs for the specified user ID.
   * @param userID The ID of the user whose logs are to be retrieved.
   * @returns An Observable of Log array.
   */
  getUserLogs(userID: number): Observable<Log[]> {
    return this.http
      .get<any[]>(`${this.apiConfig.baseURL}/logs/user/${userID}`,{
        headers: this.getAuthHeaders(),
      })
      .pipe(
        map((response) => response.map((log) => this.extractLogs(log))),
        catchError((error) => {
          console.error('Failed to fetch user logs:', error);
          throw new Error('Failed to fetch user logs');
        })
      );
  }

  /**
   * Retrieves project logs for the specified project ID and current user.
   * @param projectID The ID of the project whose logs are to be retrieved.
   * @returns An Observable of Log array.
   */
  getProjectLogs(projectID: number): Observable<Log[]> {
    return this.http
      .get<any[]>(`${this.apiConfig.baseURL}/logs/project/${projectID}`,{
        headers: this.getAuthHeaders(),
      })
      .pipe(
        map((response) => response.map((log) => this.extractLogs(log))),
        catchError((error) => {
          console.error('Failed to fetch project logs:', error);
          throw new Error('Failed to fetch project logs');
        })
      );
  }

  /**
   * Creates a log entry.
   * @param log The log data to be created.
   * @returns An Observable of the HTTP response.
   */
  private createLog(log: any): Observable<any> {
    const data = {
      actorId: log.userID,
      action: log.action,
      target: log.target,
      targetId: log.targetID,
      field: log.field,
      value: log.value,
    };
    return this.http.post(`${this.apiConfig.baseURL}/logs`, data,{
      headers: this.getAuthHeaders(),
    }).pipe(
      catchError((error) => {
        console.error('Failed to create log:', error);
        throw new Error('Failed to create log');
      })
    );
  }

  /**
   * Extracts log data.
   * @param logData The log data to be extracted.
   * @returns A Log object.
   */
  private extractLogs(logData: any): Log {
    const timeStamp = new Date(logData.timeStamp);
    return {
      logID: parseInt(logData.id),
      userID: parseInt(logData.actorId),
      action: logData.action as Action,
      target: logData.target as Target,
      targetID: parseInt(logData.targetId),
      field: logData.field,
      value: logData.value,
      timeStampLog: timeStamp,
      firstName: logData.firstName,
      lastName: logData.lastName,
    };
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }
  getToken(): string {
    return sessionStorage.getItem('authToken') || '';
  }

  //-------------------------------------------- User Logs --------------------------------------------------------------//
  addLoginLog() {
    const log = {
      userID: this.userService.getCurrentUserID(),
      action: Action.LOGIN,
      target: Target.ACCOUNT,
      targetID: this.userService.getCurrentUserID(),
      field: null,
      value: null,
    };

    this.createLog(log).subscribe(
      () => {},
      (error) => console.error('Error logging login:', error)
    );
  }

  addLogoutLog() {
    const log = {
      userID: this.userService.getCurrentUserID(),
      action: Action.LOGOUT,
      target: Target.ACCOUNT,
      targetID: this.userService.getCurrentUserID(),
      field: null,
      value: null,
    };

    this.createLog(log).subscribe(
      () => {},
      (error) => console.error('Error logging logout:', error)
    );
  }

  addCreateUserLog(createdUserID: number) {
    const log = {
      userID: this.userService.getCurrentUserID(),
      action: Action.CREATE,
      target: Target.PERSON,
      targetID: createdUserID,
      field: null,
      value: null,
    };
    this.createLog(log).subscribe(
      () => {},
      (error) => console.error('Error logging user created:', error)
    );
  }

  //TODO: Update
  addUpdateUserLog(user: User) {
    const log = {
      userID: this.userService.getCurrentUserID(),
      action: Action.UPDATE,
      target: Target.PERSON,
      targetID: user.userID,
      field: null,
      value: null,
    };

    this.createLog(log).subscribe(
      () => {},
      (error) => console.error('Error logging user update:', error)
    );
  }

  addDeleteUserLog(user: User) {
    const log = {
      userID: this.userService.getCurrentUserID(),
      action: Action.DELETE,
      target: Target.PERSON,
      targetID: user.userID,
      field: null,
      value: null,
    };

    this.createLog(log).subscribe(
      () => {},
      (error) => console.error('Error logging user deletion:', error)
    );
  }

  addCreatePasswordLog(user: User) {
    const log = {
      userID: this.userService.getCurrentUserID(),
      action: Action.CREATE,
      target: Target.PASSWORD,
      targetID: user.userID,
      field: null,
      value: null,
    };

    this.createLog(log).subscribe(
      () => {},
      (error) => console.error('Error logging password creation:', error)
    );
  }

  addUpdatePasswordLog(user: User) {
    const log = {
      userID: this.userService.getCurrentUserID(),
      action: Action.UPDATE,
      target: Target.PASSWORD,
      targetID: user.userID,
      field: null,
      value: null,
    };

    this.createLog(log).subscribe(
      () => {},
      (error) => console.error('Error logging password update:', error)
    );
  }

  //-------------------------------------------- Project Logs --------------------------------------------------------------//
  addCreateProjectLog(createdProjectID: number) {
    const log = {
      userID: this.userService.getCurrentUserID(),
      action: Action.CREATE,
      target: Target.PROJECT,
      targetID: createdProjectID,
      field: null,
      value: null,
    };

    this.createLog(log).subscribe(
      () => {},
      (error) => console.error('Error logging Project created:', error)
    );
  }

  addUpdateProjectLog(projectID: number) {
    const log = {
      userID: this.userService.getCurrentUserID(),
      action: Action.UPDATE,
      target: Target.PROJECT,
      targetID: projectID,
      field: null,
      value: null,
    };

    this.createLog(log).subscribe(
      () => {},
      (error) => console.error('Error logging project update:', error)
    );
  }

  addDeleteProjectLog(project: Project) {
    const log = {
      userID: this.userService.getCurrentUserID(),
      action: Action.DELETE,
      target: Target.PROJECT,
      targetID: project.projectID,
      field: null,
      value: null,
    };

    this.createLog(log).subscribe(
      () => {},
      (error) => console.error('Error logging project deletion:', error)
    );
  }

  //-------------------------------------------- Error Logs --------------------------------------------------------------//
  addErrorUserCreateLog(errorMessage: string) {
    const log = {
      userID: this.userService.getCurrentUserID(),
      action: Action.ERROR,
      target: Target.ACCOUNT,
      targetID: null,
      field: null,
      value: errorMessage,
    };
    this.createLog(log).subscribe(
      () => {},
      (error) => console.error('Error logging creating User:', error)
    );
  }

  addErrorProjectCreateLog(errorMessage: string) {
    const log = {
      userID: this.userService.getCurrentUserID(),
      action: Action.ERROR,
      target: Target.PROJECT,
      targetID: null,
      field: null,
      value: errorMessage,
    };
    this.createLog(log).subscribe(
      () => {},
      (error) => console.error('Error logging creating Project:', error)
    );
  }

  addErrorUserLog(errorMessage: string) {
    const log = {
      userID: this.userService.getCurrentUserID(),
      action: Action.ERROR,
      target: Target.ACCOUNT,
      targetID: this.userService.getCurrentUserID(),
      field: null,
      value: errorMessage,
    };

    this.createLog(log).subscribe(
      () => {},
      (error) => console.error('Error logging user error:', error)
    );
  }

  addErrorProjectLog(projectID: number, errorMessage: string) {
    const log = {
      userID: this.userService.getCurrentUserID(),
      action: Action.ERROR,
      target: Target.PROJECT,
      targetID: projectID,
      field: null,
      value: errorMessage,
    };

    this.createLog(log).subscribe(
      () => {},
      (error) => console.error('Error logging project error:', error)
    );
  }

  addErrorPasswordLog(selectedUserID: number,errorMessage: string) {
    const log = {
      userID: this.userService.getCurrentUserID(),
      action: Action.ERROR,
      target: Target.PASSWORD,
      targetID: selectedUserID,
      field: null,
      value: errorMessage,
    };

    this.createLog(log).subscribe(
      () => {},
      (error) => console.error('Error logging password error:', error)
    );
  }
}
