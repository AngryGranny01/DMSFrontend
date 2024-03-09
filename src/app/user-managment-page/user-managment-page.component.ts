import { Component } from '@angular/core';
import { UserService } from '../service/user.service';
import { HttpClient } from '@angular/common/http';
import { NiceDate } from '../models/niceDateInterface';
import { User } from '../models/userInterface';
import { Log } from '../models/logInterface';


@Component({
  selector: 'app-user-managment-page',
  templateUrl: './user-managment-page.component.html',
  styleUrl: './user-managment-page.component.css'
})
export class UserManagmentPageComponent {
  users: User[] = []; // Array to store user data

  constructor(private userService: UserService, private http: HttpClient) { }

  ngOnInit(): void {
    this.userService.getUsers().subscribe(users => {
      this.userService.getLogs().subscribe(logs => {
        console.log(users)
        if (Array.isArray(users)) {
          console.log("Im Called")
          this.users = users.map(user => {
            const userLogs = logs.filter((log: Log) => log.userId === user.userId);
            if (userLogs.length > 0) {
              const lastLoginDateTime = userLogs[userLogs.length - 1].dateTime;
              user.lastLogin = new NiceDate(lastLoginDateTime.year, lastLoginDateTime.month, lastLoginDateTime.day, lastLoginDateTime.hour, lastLoginDateTime.minute);
            }
            console.log(user)
            return user;
          });
        }
      });
    });
  }

  setEditModeToNewUser(){
    this.userService.isEditMode = false;
  }
}
