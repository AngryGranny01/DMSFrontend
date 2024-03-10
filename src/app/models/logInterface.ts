import { NiceDate } from "./niceDateInterface";

export interface Log {
  logId: number,
  userId: number,
  activityName: string,
  description: string,
  dateTime: NiceDate}
