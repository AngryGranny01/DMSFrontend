import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  startWith,
  switchMap,
} from 'rxjs/operators';
import { Log } from '../models/logInterface';
import { ProjectService } from '../service/project.service';
import { UserService } from '../service/user.service';
import { User } from '../models/userInterface';
import { Project } from '../models/projectInterface';
import { LogDataService } from '../service/api/log-data.service';
import { TranslationHelperService } from '../service/translation-helper.service';
import { FormControl } from '@angular/forms';
import { LogService } from '../service/log.service';
import { NiceDateService } from '../service/nice-date.service';

@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.css'],
})
export class LogsComponent implements OnInit {
  logs$: Observable<Log[]> = of([]);
  filteredLogs$: Observable<Log[]> = of([]);

  project!: Project;
  user!: User;
  isUserOrProjectLog: any;
  searchControl = new FormControl('');

  constructor(
    private projectService: ProjectService,
    private userService: UserService,
    private logDataService: LogDataService,
    private logService: LogService,
    private niceDate: NiceDateService,
    private translationHelper: TranslationHelperService
  ) {}

  ngOnInit() {
    // Determine whether it's user or project logs being displayed
    this.isUserOrProjectLog = this.logService.getIsProjectLog();

    // Load logs based on the context
    if (this.isUserOrProjectLog) {
      this.project = this.projectService.getSelectedProject();
      this.loadProjectLogs(this.project);
    } else {
      this.user = this.userService.getSelectedUser();
      this.loadUserLogs(this.user);
    }

    this.filteredLogs$ = this.searchControl.valueChanges.pipe(
      startWith(''), // Provide an initial value to start the stream
      debounceTime(300), // Debounce time to avoid processing every keystroke
      distinctUntilChanged(), // Avoid processing duplicate search terms
      switchMap((searchTerm) => {
        return this.logs$.pipe(
          map((logs) =>
            logs.filter(
              (log) =>
                log.firstName
                  .toLowerCase()
                  .includes(searchTerm!.toLowerCase()) ||
                log.lastName
                  .toLowerCase()
                  .includes(searchTerm!.toLowerCase()) ||
                log.action
                  .toLowerCase()
                  .includes(searchTerm!.toLowerCase()) ||
                log.target
                  .toLowerCase()
                  .includes(searchTerm!.toLowerCase())||
                log.description.toLowerCase().includes(searchTerm!.toLowerCase())
            )
          )
        );
      })
    );
  }

  // Load logs associated with a project
  loadProjectLogs(project: Project) {
    this.logDataService.getProjectLogs(project.projectID).subscribe(
      (logs) => {
        console.log('Im Called');
        this.processLogs(logs);
      },
      (error) => {
        console.error('Error loading project logs:', error);
        // Optionally, notify the user about the error
      }
    );
  }

  // Load logs associated with a user
  loadUserLogs(user: User) {
    this.logDataService.getUserLogs(user.userID).subscribe(
      (logs) => {
        console.log('Im Called');
        this.processLogs(logs);
      },
      (error) => {
        console.error('Error loading user logs:', error);
        // Optionally, notify the user about the error
      }
    );
  }

  // Process logs to translate log descriptions and update logs$ observable
  private processLogs(logs: Log[]) {
    console.log(logs)
    for (let log of logs) {
      log.description = this.translationHelper.translateLog(log);
    }
    this.logs$ = of(logs);
  }

  // Format date as a string
  createDateString(date: Date) {
    const newDate = this.niceDate.formatDate(date);
    return `${newDate}`;
  }

  // Format time as a string
  createTimeString(date: Date) {
    const newDate = this.niceDate.formatTime(date);
    return `${newDate} Uhr`;
  }
}
