import { NiceDate } from "./niceDateInterface";
import { ActivityName } from "./activityName";

export interface Log {
  logId: number,
  userId: number,
  firstName: string,
  lastName: string,
  activityName: ActivityName,
  description: string,
  dateTime: NiceDate
};

export const logDescriptionValues = {
  userID: 0,
  username: "",
  timeStamp: new NiceDate(0, 0, 0, 0, 0),
  projectName: "",
  projectID: 0,
  viewedUserID: 0,
  viewedUsername: "",
  filename: "",
  errorMessage: ""
};

