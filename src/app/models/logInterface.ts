import { NiceDate } from "./niceDateInterface";

export interface Log {
  logId: number,
  userId: number,
  activityName: string,
  description: string,
  dateTime: NiceDate}
/*
LOGIN: Used to log user login events.
LOGOUT: Used to log user logout events.
CREATE: Used to log creation events, such as creating a new user account, project, or document.
UPDATE: Used to log updates or modifications to existing records or entities.
DELETE: Used to log deletion events, such as deleting a user account, project, or document.
VIEW: Used to log when a user views or accesses a specific resource or page.
UPLOAD: Used to log when a user uploads a file or document.
DOWNLOAD: Used to log when a user downloads a file or document.
ERROR: Used to log errors or exceptions that occur during application execution.
WARNING: Used to log warning messages or alerts.
*/
