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
}
