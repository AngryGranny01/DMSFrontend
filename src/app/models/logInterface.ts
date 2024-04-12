import { ActivityName } from './activityName';

export interface Log {
  logID: number;
  userID: number;
  firstName: string;
  lastName: string;
  activityName: ActivityName;
  description: string;
  dateTime: Date;
}
