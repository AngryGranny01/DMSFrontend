import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { User } from '../../models/userInterface';
import { Project } from '../../models/projectInterface';
import { Log } from '../../models/logInterface';
import { ActivityName } from '../../models/activityName';
import { LogDescriptionValues } from '../../models/logDescriptionValues';

import { ApiConfigService } from './api-config.service';
import { LogService } from '../log.service';
import { UserService } from '../user.service';
import { EncryptionService } from '../encryption.service';
import { STANDARD_PUBLIC_KEY } from '../../constants/env';

@Injectable({
  providedIn: 'root',
})
export class LogDataService {
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
    private logService: LogService,
    private userService: UserService,
    private encryptionService: EncryptionService
  ) {}

  /**
   * Retrieves user logs for the specified user ID and private key.
   * @param userID The ID of the user whose logs are to be retrieved.
   * @param privateKey The private key used for decryption.
   * @returns An Observable of Log array.
   */
  getUserLogs(userID: number, privateKey: string): Observable<Log[]> {
    return this.http
      .get<any[]>(`${this.apiConfig.baseURL}/user-logs/${userID}`)
      .pipe(
        map((response: any[]) =>
          response.map((userLog) =>
            this.decryptAndExtractLogs(userLog, privateKey)
          )
        )
      );
  }

  /**
   * Retrieves project logs for the specified project ID and current user.
   * @param projectID The ID of the project whose logs are to be retrieved.
   * @param currentUser The current user accessing the logs.
   * @returns An Observable of Log array.
   */
  getProjectLogs(projectID: number, currentUser: User): Observable<Log[]> {
    return this.http
      .get<any[]>(
        `${this.apiConfig.baseURL}/project-logs?projectID=${projectID}&userID=${currentUser.userID}`
      )
      .pipe(
        map((response: any[]) =>
          response.map((projectLog) =>
            this.decryptAndExtractLogs(projectLog, currentUser.privateKey)
          )
        )
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
      activityName: this.encryptionService.encryptRSA(
        log.activityName,
        STANDARD_PUBLIC_KEY
      ),
      activityDescription: this.encryptionService.encryptRSA(
        log.description,
        STANDARD_PUBLIC_KEY
      ),
    };
    return this.http.post(`${this.apiConfig.baseURL}/user-logs`, data);
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
      activityName: this.encryptionService.encryptRSA(
        log.activityName,
        STANDARD_PUBLIC_KEY
      ),
      activityDescription: this.encryptionService.encryptRSA(
        log.description,
        STANDARD_PUBLIC_KEY
      ),
    };
    return this.http.post(`${this.apiConfig.baseURL}/project-logs`, data);
  }

  /**
   * Decrypts and extracts log data.
   * @param logData The encrypted log data to be decrypted.
   * @param privateKey The private key used for decryption.
   * @returns A Log object.
   */
  private decryptAndExtractLogs(logData: any, privateKey: string): Log {
    const timeStamp = new Date(
      this.encryptionService.decryptRSA(logData.timeStamp, privateKey)
    );

    return {
      logID: parseInt(logData.logID),
      userID: parseInt(logData.userID),
      firstName: this.encryptionService.decryptRSA(
        logData.firstName,
        privateKey
      ),
      lastName: this.encryptionService.decryptRSA(logData.lastName, privateKey),
      activityName: this.logService.matchActivityNameWithString(
        this.encryptionService.decryptRSA(logData.activityName, privateKey)
      ),
      description: this.encryptionService.decryptRSA(
        logData.activityDescription,
        privateKey
      ),
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

    this.createProjectLog(log).subscribe(
      () => console.log('Project deletion logged successfully'),
      (error) => console.error('Error logging project deletion:', error)
    );
  }

  //-------------------------------------------- Error Logs --------------------------------------------------------------//
  addErrorUserLog(errorMessage: string) {
    const log = {
      description: LogDescriptionValues.createLogDescription(
        ActivityName.DELETE_USER,
        errorMessage
      ),
      activityName: ActivityName.DELETE_USER,
      userID: this.userService.getCurrentUserID(),
    };

    this.createUserLog(log).subscribe(
      () => console.log('User deletion logged successfully'),
      (error) => console.error('Error logging user deletion:', error)
    );
  }

  addErrorProjectLog(project: Project, errorMessage: string) {
    const log = {
      description: LogDescriptionValues.createLogDescription(
        ActivityName.ERROR,
        errorMessage
      ),
      activityName: ActivityName.ERROR,
      userID: this.userService.getCurrentUserID(),
      projectID: project.projectID,
    };

    this.createProjectLog(log).subscribe(
      () => console.log('Project deletion logged successfully'),
      (error) => console.error('Error logging project deletion:', error)
    );
  }
}
