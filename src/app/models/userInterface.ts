import { Role } from "./role";

export class User{
  constructor(
    public username: string,
    public firstname: string,
    public lastname: string,
    public password: string,
    public role: Role,
    public email: string
  ) {}
}


export const userAdmin: User = new User("admin","max","mustermann","1234", Role.ADMIN,"asdasd")
export const userUser: User = new User("user","max","mustermann","1234", Role.USER,"asdasd")
export const userProjectManager: User = new User("manager","max","mustermann","1234", Role.MANAGER,"asdasd")
