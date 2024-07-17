import { Action } from './logActionEnum';
import { Target } from './logTargetEnum';
import { Role } from './roleEnum';

export interface Log {
  logID: number;
  userID: number;
  action: Action;
  target: Target;
  targetID: number;
  field: any;
  value: any;
  timeStampLog: Date;
  description: string;
  firstName: string;
  lastName: string;
  currentActorRole: Role;
}
