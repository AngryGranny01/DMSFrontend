import { Component, ElementRef, ViewChild } from '@angular/core';
import { Observable, Subject, of, takeUntil } from 'rxjs';
import { Project } from '../models/projectInterface';
import { User } from '../models/userInterface';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { ProjectService } from '../service/project.service';
import { UserDataService } from '../service/api/user-data.service';
import { Role } from '../models/role';
import { NiceDate } from '../models/niceDateInterface';
import { UserService } from '../service/user.service';

@Component({
  selector: 'app-create-project',
  templateUrl: './create-project.component.html',
  styleUrl: './create-project.component.css',
  providers: [DashboardComponent],
})
export class CreateProjectComponent {
  @ViewChild('input') input!: ElementRef<HTMLInputElement>;
  myControl = new FormControl('');
  options: { fullName: string, username: string }[] = []; // Initialize as an empty array
  filteredOptions: { fullName: string, username: string }[] = [];

  startDateControl = new FormControl();
  project!: Project;

  myDate!: Date; // Property to bind the selected date
  minDate: Date = new Date(); // Property to set the minimum selectable date (today)
  // Set the maximum selectable date to today's date plus 5 years
  maxDate!: Date;

  isEditMode: boolean = false;
  users$: Observable<User[]> = of([]);
  projectName: any;
  projectDescription: any;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private projectService: ProjectService,
    private userDataService: UserDataService,
    private userService: UserService
  ) {
    this.filteredOptions = this.options.slice();
  }

  ngOnInit() {
    if (this.projectService.isProjectEditMode) {
      this.isEditMode = true;
      this.project = this.projectService.getSelectedProject();
      this.setInputFieldsForEditProject();
    } else {
      this.isEditMode = false;
      this.setInputFieldsForNewProject();
      console.log(this.users$);
    }
    this.loadAllUsers();
  }

  setInputFieldsForEditProject() {
    // Set Project Name Field
    this.projectName = this.project.name;

    // Set Project Manager Field
    this.myControl = new FormControl(
      this.userService.concatenateFirstnameLastname(
        this.project.manager.firstname,
        this.project.manager.lastname
      )
    );

    //set Date Field
    this.myDate = new Date(
      this.project.endDate.year,
      this.project.endDate.month,
      this.project.endDate.month
    );
    this.maxDate = new Date(
      this.myDate.getFullYear() + 5,
      this.myDate.getMonth(),
      this.myDate.getDate()
    );
    //set Project Description Field
    this.projectDescription = this.project.description;
  }

  setInputFieldsForNewProject() {
    //set Project Manager Field
    //set Date Field
    const today = new Date();
    this.maxDate = new Date(
      today.getFullYear() + 5,
      today.getMonth(),
      today.getDate()
    );
  }

  loadAllUsers() {
    this.users$ = this.userDataService.getAllUsers()
    this.users$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((users) => {
        this.options = users
          .filter(user => user.role === Role.ADMIN || user.role === Role.MANAGER)
          .map(user => ({ fullName: `${user.firstname} ${user.lastname}`, username: user.username }));
        this.filteredOptions = [...this.options];
      });
  }

  userExistsInProject(user: User): boolean {
    if (this.project === undefined) {
      return false;
    }
    return !!this.project.users.find(
      (projectUser) => projectUser.userID === user.userID
    );
  }

  filter(): void {
    const filterValue = this.input.nativeElement.value.toLowerCase();
    this.filteredOptions = this.options.filter((option) => {
      const [fullName, username] = option.fullName.split('#');
      return fullName.toLowerCase().includes(filterValue) || username.toLowerCase().includes(filterValue);
    });
  }

  saveProject() {}

  createNewProject() {}

  updateProject() {}

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
