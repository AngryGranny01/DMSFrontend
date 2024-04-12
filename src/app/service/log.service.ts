import { Injectable } from '@angular/core';
import { ActivityName } from '../models/activityName';

@Injectable({
  providedIn: 'root',
})
export class LogService {
  // Indicates whether the log service is for project-related logs
  private isProjectLog: boolean = true;

  constructor() {}

  /**
   * Matches an activity string with an ActivityName enum value.
   * @param activity The activity string to match.
   * @returns The corresponding ActivityName enum value if found, otherwise returns UNKNOWN.
   */
  matchActivityNameWithString(activity: string): ActivityName {
    const activityUpper = activity.toUpperCase();

    if (Object.values(ActivityName).includes(activityUpper as ActivityName)) {
      return activityUpper as ActivityName;
    }

    return ActivityName.UNKNOWN;
  }

  /**
   * Gets the value indicating whether the log service is for project-related logs.
   * @returns True if the log service is for project-related logs, otherwise false.
   */
  getIsProjectLog(): boolean {
    return this.isProjectLog;
  }

  /**
   * Sets the value indicating whether the log service is for project-related logs.
   * @param isProjectLog True to indicate that the log service is for project-related logs, otherwise false.
   */
  setIsProjectLog(isProjectLog: boolean): void {
    this.isProjectLog = isProjectLog;
  }
}
