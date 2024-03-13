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


