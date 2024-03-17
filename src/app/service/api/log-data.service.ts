import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../../models/userInterface';
import { Project } from '../../models/projectInterface';
import { Observable, map } from 'rxjs';
import { Log } from '../../models/logInterface';
import { ApiConfigService } from './api-config.service';
import { ActivityName } from '../../models/activityName';
import { NiceDate } from '../../models/niceDateInterface';
import { LogService } from '../log.service';
import { LogDescriptionValues } from '../../models/logDescriptionValues';
import { ProjectManagerDataService } from './project-manager-data.service';
import { UserDataService } from './user-data.service';
import { UserService } from '../user.service';
import { EncryptionService } from '../encryption.service';

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

  //-------------------------------------------- Get-Requests --------------------------------------------------------------//
  getUserLogs(userID: number): Observable<Log[]> {
    return this.http
      .get<any[]>(`${this.apiConfig.baseURL}/logs/user?userID=${userID}`)
      .pipe(
        map((response: any[]) =>
          response.map((userLog) => this.extractLog(userLog))
        )
      );
  }

  getProjectLogs(projectID: number): Observable<Log[]> {
    return this.http
      .get<any[]>(
        `${this.apiConfig.baseURL}/logs/project?projectID=${projectID}`
      )
      .pipe(
        map((response: any[]) =>
          response.map((projectLog) => this.extractLog(projectLog))
        )
      );
  }

  //-------------------------------------------- Post-Requests --------------------------------------------------------------//
  createUserLog(log: Log): Observable<any> {
    const data = {
      userID: log.userId,
      activityName: log.activityName,
      activityDescription: log.description,
    };
    console.log('User Log Data: ', data);
    return this.http.post(`${this.apiConfig.baseURL}/user-logs`, data);
  }

  createProjectLog(log: Log, projectID: number, userKey: string): Observable<any> {
    const data = {
      projectID: projectID,
      userID: log.userId,
      activityName: log.activityName,
      activityDescription: log.description,
    };
    let encryptedData = this.encryptionService.encryptLogData(data, userKey)

    return this.http.post(`${this.apiConfig.baseURL}/project-logs`, data);
  }

  private extractLog(logData: any): Log {
    const timeStamp = new NiceDate(
      logData.timeStamp.year,
      logData.timeStamp.month,
      logData.timeStamp.day,
      logData.timeStamp.hour,
      logData.timeStamp.minute
    );

    return {
      logId: logData.logID,
      userId: logData.userID,
      firstName: logData.firstName,
      lastName: logData.lastName,
      activityName: this.logService.matchActivityNameWithString(
        logData.activityName
      ),
      description: logData.activityDescription,
      dateTime: timeStamp,
    };
  }

  addLoginLog() {
    const log: Log = {
      description: LogDescriptionValues.createLogDescription(
        ActivityName.LOGIN,
        this.userService.getCurrentUserID(),
        this.userService.getCurrentUsername()
      ),
      activityName: ActivityName.LOGIN,
      userId: this.userService.getCurrentUserID(),
      logId: 0,
      firstName: '',
      lastName: '',
      dateTime: new NiceDate(0, 0, 0, 0, 0),
    };

    this.createUserLog(log).subscribe(
      () => console.log('Login logged successfully'),
      (error) => console.error('Error logging login:', error)
    );
  }

  addLogoutLog() {
    const log: Log = {
      description: LogDescriptionValues.createLogDescription(
        ActivityName.LOGOUT,
        this.userService.getCurrentUserID(),
        this.userService.getCurrentUsername()
      ),
      activityName: ActivityName.LOGOUT,
      userId: this.userService.getCurrentUserID(),
      logId: 0,
      firstName: '',
      lastName: '',
      dateTime: new NiceDate(0, 0, 0, 0, 0),
    };

    this.createUserLog(log).subscribe(
      () => console.log('Logout logged successfully'),
      (error) => console.error('Error logging logout:', error)
    );
  }

  addCreateUserLog(userID: number, username: string) {
    const log: Log = {
      description: LogDescriptionValues.createLogDescription(
        ActivityName.CREATE_USER,
        userID,
        username
      ),
      activityName: ActivityName.CREATE_USER,
      userId: userID,
      logId: 0,
      firstName: '',
      lastName: '',
      dateTime: new NiceDate(0, 0, 0, 0, 0),
    };

    return this.createUserLog(log);
  }

  addUpdateUserLog(user: User) {
    const log: Log = {
      description: LogDescriptionValues.createLogDescription(
        ActivityName.UPDATE_USER,
        user.userID,
        user.username
      ),
      activityName: ActivityName.UPDATE_USER,
      userId: this.userService.getCurrentUserID(),
      logId: 0,
      firstName: '',
      lastName: '',
      dateTime: new NiceDate(0, 0, 0, 0, 0),
    };

    this.createUserLog(log).subscribe(
      () => console.log('User update logged successfully'),
      (error) => console.error('Error logging user update:', error)
    );
  }

  addDeleteUserLog(user: User) {
    const log: Log = {
      description: LogDescriptionValues.createLogDescription(
        ActivityName.DELETE_USER,
        user.userID,
        user.username
      ),
      activityName: ActivityName.DELETE_USER,
      userId: this.userService.getCurrentUserID(),
      logId: 0,
      firstName: '',
      lastName: '',
      dateTime: new NiceDate(0, 0, 0, 0, 0),
    };

    this.createUserLog(log).subscribe(
      () => console.log('User deletion logged successfully'),
      (error) => console.error('Error logging user deletion:', error)
    );
  }

  addCreateProjectLog(projectID: number, projectName: string) {
    const log: Log = {
      description: LogDescriptionValues.createLogDescription(
        ActivityName.CREATE_PROJECT,
        '',
        '',
        projectName,
        projectID
      ),
      activityName: ActivityName.CREATE_PROJECT,
      userId: this.userService.getCurrentUserID(),
      logId: 0,
      firstName: '',
      lastName: '',
      dateTime: new NiceDate(0, 0, 0, 0, 0),
    };

    return this.createProjectLog(log, projectID, this.userService.getCurrentUser().password);
  }

  addUpdateProjectLog(projectID: number, projectName: string) {
    const log: Log = {
      description: LogDescriptionValues.createLogDescription(
        ActivityName.UPDATE_PROJECT,
        projectID,
        projectName
      ),
      activityName: ActivityName.UPDATE_PROJECT,
      userId: this.userService.getCurrentUserID(),
      logId: 0,
      firstName: '',
      lastName: '',
      dateTime: new NiceDate(0, 0, 0, 0, 0),
    };

    this.createProjectLog(log, projectID, this.userService.getCurrentUser().password).subscribe(
      () => console.log('Project update logged successfully'),
      (error) => console.error('Error logging project update:', error)
    );
  }

  addDeleteProjectLog(project: Project) {
    const log: Log = {
      description: LogDescriptionValues.createLogDescription(
        ActivityName.DELETE_PROJECT,
        project.projectID,
        project.name
      ),
      activityName: ActivityName.DELETE_PROJECT,
      userId: this.userService.getCurrentUserID(),
      logId: 0,
      firstName: '',
      lastName: '',
      dateTime: new NiceDate(0, 0, 0, 0, 0),
    };

    this.createProjectLog(log, project.projectID,this.userService.getCurrentUser().password).subscribe(
      () => console.log('Project deletion logged successfully'),
      (error) => console.error('Error logging project deletion:', error)
    );
  }

  addErrorUserLog(errorMessage: string) {
    const log: Log = {
      description: LogDescriptionValues.createLogDescription(
        ActivityName.DELETE_USER,
        errorMessage
      ),
      activityName: ActivityName.DELETE_USER,
      userId: this.userService.getCurrentUserID(),
      logId: 0,
      firstName: '',
      lastName: '',
      dateTime: new NiceDate(0, 0, 0, 0, 0),
    };

    this.createUserLog(log).subscribe(
      () => console.log('User deletion logged successfully'),
      (error) => console.error('Error logging user deletion:', error)
    );
  }

  addErrorProjectLog(project: Project, errorMessage: string) {
    const log: Log = {
      description: LogDescriptionValues.createLogDescription(
        ActivityName.ERROR,
        errorMessage
      ),
      activityName: ActivityName.ERROR,
      userId: this.userService.getCurrentUserID(),
      logId: 0,
      firstName: '',
      lastName: '',
      dateTime: new NiceDate(0, 0, 0, 0, 0),
    };

    this.createProjectLog(log, project.projectID, this.userService.getCurrentUser().password).subscribe(
      () => console.log('Project deletion logged successfully'),
      (error) => console.error('Error logging project deletion:', error)
    );
  }
}
