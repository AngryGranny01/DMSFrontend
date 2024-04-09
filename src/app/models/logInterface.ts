import { NiceDate } from "./niceDateInterface";
import { ActivityName } from "./activityName";

export interface Log {
  logID: number,
  userID: number,
  firstName: string,
  lastName: string,
  activityName: ActivityName,
  description: string,
  dateTime: Date
};

export const logDescriptionValues = {
  userID: 0,
  username: "",
  timeStamp: new Date(),
  projectName: "",
  projectID: 0,
  viewedUserID: 0,
  viewedUsername: "",
  filename: "",
  errorMessage: ""
};


