import { NiceDate } from './niceDateInterface';
import { User } from './userInterface';

export class Project {
  constructor(
    public name: string,
    public managerID: number,
    public users: User[],
    public description: string,
    public key: string,
    public endDate: NiceDate
  ) {}
}
