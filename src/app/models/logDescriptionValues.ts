import { ActivityName } from "./activityName";

export class LogDescriptionValues {
  constructor(
    public userID: number | string = "",
    public username: string = "",
    public timeStamp: Date | string = new Date(),
    public projectName: string = "",
    public projectID: number | string = "",
    public viewedUserID: number | string = "",
    public viewedUsername: string = "",
    public filename: string = "",
    public errorMessage: string = ""
  ) {}

  // Method to convert LogDescriptionValues to a string
  toString(): string {
    return JSON.stringify({
      userID: this.userID,
      username: this.username,
      timeStamp: this.timeStamp instanceof Date ? this.timeStamp.toISOString() : this.timeStamp,
      projectName: this.projectName,
      projectID: this.projectID,
      viewedUserID: this.viewedUserID,
      viewedUsername: this.viewedUsername,
      filename: this.filename,
      errorMessage: this.errorMessage
    });
  }

  // Method to parse a string and convert it into LogDescriptionValues
  static fromString(str: string): LogDescriptionValues {
    const obj = JSON.parse(str);
    return new LogDescriptionValues(
      obj.userID,
      obj.username,
      new Date(obj.timeStamp),
      obj.projectName,
      obj.projectID,
      obj.viewedUserID,
      obj.viewedUsername,
      obj.filename,
      obj.errorMessage
    );
  }

  // Method to create log description based on activity name
  static createLogDescription(activity: ActivityName, userID: number | string = "", username: string = "", projectName: string = "", projectID: number | string = "", viewedUserID: number | string = "", viewedUsername: string = "", filename: string = "", errorMessage: string = ""): string {
    switch (activity) {
      case ActivityName.LOGIN:
        return new LogDescriptionValues(userID, username, new Date(), "", "", "", "", "", "").toString();
      case ActivityName.LOGOUT:
        return new LogDescriptionValues(userID, username, new Date(), "", "", "", "", "", "").toString();
      case ActivityName.CREATE_USER:
        return new LogDescriptionValues(userID, username, "", "", "", "", "", "", "").toString();
      case ActivityName.CREATE_PROJECT:
        return new LogDescriptionValues("", "", "", projectName, projectID, "", "", "", "").toString();
      case ActivityName.UPDATE_USER:
        return new LogDescriptionValues(userID, username, "", "", "", "", "", "", "").toString();
      case ActivityName.UPDATE_PROJECT:
        return new LogDescriptionValues("", "", "", projectName, projectID, "", "", "", "").toString();
      case ActivityName.DELETE_USER:
        return new LogDescriptionValues(userID, username, "", "", "", "", "", "", "").toString();
      case ActivityName.DELETE_PROJECT:
        return new LogDescriptionValues("", "", "", projectName, projectID, "", "", "", "").toString();
      case ActivityName.VIEW_PROJECT:
        return new LogDescriptionValues(userID, username, "", projectName, projectID, "", "", "", "").toString();
      case ActivityName.VIEW_USER:
        return new LogDescriptionValues(userID, username, "", "", "", viewedUserID, viewedUsername, "", "").toString();
      case ActivityName.UPLOAD:
        return new LogDescriptionValues("", "", "", "", "", "", "", filename, "").toString();
      case ActivityName.DOWNLOAD:
        return new LogDescriptionValues("", "", "", "", "", "", "", filename, "").toString();
      case ActivityName.ERROR:
        return new LogDescriptionValues("", "", "", "", "", "", "", "", errorMessage).toString();
      default:
        return new LogDescriptionValues("", "", "", "", "", "", "", "", "").toString();
    }
  }
}
