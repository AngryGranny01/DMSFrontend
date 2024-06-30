
import { User } from './userInterface';

export class Project {
  constructor(
    public projectID: number,
    public name: string,
    public manager: User,
    public users: User[],
    public description: string,
    public endDate: Date | null
  ) {}
}
