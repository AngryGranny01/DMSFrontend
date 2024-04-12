import { Component } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
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
import { TranslateService } from '@ngx-translate/core';
import { FormControl } from '@angular/forms';
import { LogService } from '../service/log.service';
import { NiceDateService } from '../service/nice-date.service';

@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.css'],
})
export class LogsComponent {
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
    private translationHelper: TranslationHelperService,
    private translate: TranslateService,
    private niceDate: NiceDateService
  ) {}

  ngOnInit() {
    this.isUserOrProjectLog = this.logService.getIsProjectLog();
    if (this.logService.getIsProjectLog()) {
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
                log.activityName
                  .toLowerCase()
                  .includes(searchTerm!.toLowerCase()) ||
                log.description
                  .toLowerCase()
                  .includes(searchTerm!.toLowerCase())
            )
          )
        );
      })
    );
  }

  loadProjectLogs(project: Project) {
    this.logDataService.getProjectLogs(project.projectID, this.userService.currentUser).subscribe(
      (logs) => {
        console.log(logs)
        this.processLogs(logs);
      },
      (error) => {
        console.error('Error loading project logs:', error);
        // Optionally, notify the user about the error
      }
    );
  }

  loadUserLogs(user: User) {
    this.logDataService.getUserLogs(user.userID, user.privateKey).subscribe(
      (logs) => {
        this.processLogs(logs);
      },
      (error) => {
        console.error('Error loading user logs:', error);
        // Optionally, notify the user about the error
      }
    );
  }

  private processLogs(logs: Log[]) {
    for (let log of logs) {
      let activityDescription =
        this.translationHelper.getTranslatedLogDescription(
          log.activityName,
          log.description
        );
      this.translate
        .get(log.activityName, activityDescription)
        .subscribe((translations) => {
          log.description = translations;
        });
    }
    this.logs$ = of(logs);
  }

  createDateString(date: Date) {
    const newDate = this.niceDate.formatDate(date);
    return `${newDate}`;
  }

  createTimeString(date: Date) {
    const newDate = this.niceDate.formatTime(date);
    return `${newDate} Uhr`;
  }
}
