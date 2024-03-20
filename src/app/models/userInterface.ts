import { NiceDate } from './niceDateInterface';
import { Role } from './role';

export class User {
  constructor(
    public userID: number,
    public userName: string,
    public firstName: string,
    public lastName: string,
    public passwordHash: string,
    public role: Role,
    public email: string,
    public orgEinheit: string,
    public publicKey: string
  ) {}
}
