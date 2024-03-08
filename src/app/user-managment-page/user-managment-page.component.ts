import { Component } from '@angular/core';
import { UserService } from '../service/user.service';


@Component({
  selector: 'app-user-managment-page',
  templateUrl: './user-managment-page.component.html',
  styleUrl: './user-managment-page.component.css'
})
export class UserManagmentPageComponent {
  constructor(private userService: UserService){}

  setEditModeToNewUser(){
    this.userService.isEditMode = false;
  }
}
