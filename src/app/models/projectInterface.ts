import { NiceDate } from './niceDateInterface';
import { User } from './userInterface';

export class Project {
  constructor(
    public projectID: number,
    public name: string,
    public managerID: number,
    public manager: User,
    public users: User[],
    public description: string,
    public key: string,
    public endDate: NiceDate
  ) {}
}
