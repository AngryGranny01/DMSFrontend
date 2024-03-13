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

@Injectable({
  providedIn: 'root',
})

//TODO: Handle the switch in Language
export class LogDataService {
  constructor(private http: HttpClient,private apiConfig: ApiConfigService, private logService: LogService) {}

  //-------------------------------------------- Get-Requests --------------------------------------------------------------//
  getUserLogs(userID: number): Observable<Log[]> {
    return this.http.get<any[]>(`${this.apiConfig.baseURL}/logs/user?userID=${userID}`).pipe(
      map((response: any[]) => response.map(userLog => this.extractLog(userLog)))
    );
  }

  getProjectLogs(projectID: number): Observable<Log[]> {
    return this.http.get<any[]>(`${this.apiConfig.baseURL}/logs/project?projectID=${projectID}`).pipe(
      map((response: any[]) => response.map(projectLog => this.extractLog(projectLog)))
    );
  }

  //-------------------------------------------- Post-Requests --------------------------------------------------------------//
  createUserLog(log: Log) {
    console.log(log)
    const data = {
      userID: log.userId,
      activityName: log.activityName,
      activityDescription: log.description
    }
    return this.http.post(`${this.apiConfig.baseURL}/user-logs`, data);
  }

  createProjectLog(log: Log, projectID: number) {
    const data = {
      projectID: projectID,
      userID: log.userId,
      activityName: log.activityName,
      activityDescription: log.description,
    }
    return this.http.post(`${this.apiConfig.baseURL}/project-logs`, data);
  }


  private extractLog(logData: any): Log {
    // Implement your logic to extract Log data from logData object
    // For example:
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
      activityName: this.logService.matchActivityNameWithString(logData.activityName),
      description: logData.activityDescription,
      dateTime: timeStamp
    };
  }

}


