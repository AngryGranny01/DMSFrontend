import { NiceDate } from "./niceDateInterface";
import { Role } from "./role";

export class User{
  constructor(
    public userId: number,
    public username: string,
    public firstname: string,
    public lastname: string,
    public password: string,
    public role: Role,
    public email: string,
    public lastLogin: NiceDate
  ) {}
}


export const userAdmin: User = new User(2,"admin","max","mustermann","1234", Role.ADMIN,"asdasd",new NiceDate(2022,2,4,14,0))
export const userUser: User = new User(1,"user","max","mustermann","1234", Role.USER,"asdasd",new NiceDate(2022,2,4,14,0))
export const userProjectManager: User = new User(3,"manager","max","mustermann","1234", Role.MANAGER,"asdasd",new NiceDate(2022,2,4,14,0))
