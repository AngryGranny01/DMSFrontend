import { Role } from './role';

export class User {
  constructor(
    public userID: number,
    public firstName: string,
    public lastName: string,
    public role: Role,
    public email: string,
    public orgUnit: string,
    public isDeactivated: boolean
  ) {}
}
