import { Injectable } from '@angular/core';
import { ActivityName } from '../models/activityName';

@Injectable({
  providedIn: 'root'
})
export class LogService {
  isProjectLog: boolean = true;

  constructor() { }

  matchActivityNameWithString(activity: string): ActivityName {
    // Convert the string to uppercase for case-insensitive comparison
    const activityUpper = activity.toUpperCase();

    // Check if the activity string exists in the ActivityName enum
    if (Object.values(ActivityName).includes(activityUpper as ActivityName)) {
      return activityUpper as ActivityName;
    }

    // If no match found, return "UNKNOWN"
    return ActivityName.UNKNOWN;
  }

  getIsProjectLog(){
    return this.isProjectLog
  }

  setIsProjectLog(isProjectLog: boolean){
    this.isProjectLog = isProjectLog;
  }
}
