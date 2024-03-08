import { NiceDate } from './niceDateInterface';
import { User } from './userInterface';

export class Project {
  constructor(
    public name: string,
    public manager: string,
    public users: User[],
    public description: string,
    public endDate: NiceDate
  ) {}
}
