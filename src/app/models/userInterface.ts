import { Role } from './role';

export class User {
  constructor(
    public userID: number,
    public userName: string,
    public firstName: string,
    public lastName: string,
    public salt: string,
    public role: Role,
    public email: string,
    public orgUnit: string
  ) {}
}
