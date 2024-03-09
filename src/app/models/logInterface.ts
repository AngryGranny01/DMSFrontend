import { NiceDate } from "./niceDateInterface";

export interface Log {

  logId: number,
  userId: number,
  ActivityName: string,
  description: string,
  dateTime: NiceDate}
