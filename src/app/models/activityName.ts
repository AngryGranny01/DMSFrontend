/*
LOGIN: Used to log user login events.
LOGOUT: Used to log user logout events.
CREATE_USER: Used to log creation events, such as creating a new user account.
CREATE_PROJECT: Used to log creation events, such as creating a new project.
UPDATE_USER: Used to log updates or modifications to user records.
UPDATE_PROJECT: Used to log updates or modifications to project records.
DELETE_USER: Used to log deletion events, such as deleting a user account.
DELETE_PROJECT: Used to log deletion events, such as deleting a project.
VIEW_PROJECT: Used to log when a user views or accesses a specific project.
VIEW_USER: Used to log when a user views or accesses a specific user account.
UPLOAD: Used to log when a user uploads a file or document.
DOWNLOAD: Used to log when a user downloads a file or document.
ERROR: Used to log errors or exceptions that occur during application execution.
*/

export enum ActivityName {
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
  CREATE_USER = "CREATE_USER",
  CREATE_PROJECT = "CREATE_PROJECT",
  UPDATE_USER = "UPDATE_USER",
  UPDATE_PROJECT = "UPDATE_PROJECT",
  DELETE_USER = "DELETE_USER",
  DELETE_PROJECT = "DELETE_PROJECT",
  VIEW_PROJECT = "VIEW_PROJECT",
  VIEW_USER = "VIEW_USER",
  UPLOAD = "UPLOAD",
  DOWNLOAD = "DOWNLOAD",
  ERROR = "ERROR",
  UNKNOWN = "UNKNOWN"
}

