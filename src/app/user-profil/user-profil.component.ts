import { Component } from '@angular/core';
import { UserService } from '../service/user.service';
import { User } from '../models/userInterface';
import { Role } from '../models/role';

@Component({
  selector: 'app-user-profil',
  templateUrl: './user-profil.component.html',
  styleUrl: './user-profil.component.css',
})
export class UserProfilComponent {
  constructor(private userService: UserService) {}
  user?: User; // Initialize an empty user object
  isEditMode: boolean = false;

  ngOnInit() {
    // Check if the user data is available (in edit mode)

      if(this.userService.isEditMode){
        this.isEditMode = true;
        this.user = { ...this.userService.currentUser }; // Load user data into the form fields
      }else{
        this.isEditMode = false;
        this.user = new User('','','','',Role.USER,'')
      }
  }

  isAdmin(): boolean {
    return this.userService.isAdmin();
  }

  saveProfile() {
    if (this.isEditMode) {
      //reset edit mode because it is only set on true if AddNewUser button is pressed
    } else {
      // Logic to create new user profile
      this.userService.isEditMode = true;
    }
  }
}
