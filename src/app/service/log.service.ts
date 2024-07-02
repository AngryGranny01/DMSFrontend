import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LogService {
  // Indicates whether the log service is for project-related logs
  private isProjectLog: boolean = true;

  constructor() {}
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
