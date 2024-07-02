import { Action } from './logActionEnum';
import { Target } from './logTargetEnum';

export interface Log {
  logID: number;
  userID: number;
  action: Action;
  target: Target;
  targetID: number;
  field: any;
  value: any;
  timeStampLog: Date;
  firstName: string;
  lastName: string;
}
