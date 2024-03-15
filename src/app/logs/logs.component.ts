import { Component } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Log } from '../models/logInterface';
import { ProjectService } from '../service/project.service';
import { UserService } from '../service/user.service';
import { User } from '../models/userInterface';
import { Project } from '../models/projectInterface';
import { LogDataService } from '../service/api/log-data.service';
import { LogService } from '../service/log.service';
import { TranslationHelperService } from '../service/translation-helper.service';

@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrl: './logs.component.css',
})
export class LogsComponent {
  logs$: Observable<Log[]> = of([]);
  project!: Project;
  user!: User;
  isUserOrProjectLog: any;

  constructor(
    private projectService: ProjectService,
    private userService: UserService,
    private logService: LogService,
    private logDataService: LogDataService,
    private translationHelper: TranslationHelperService
  ) {}

  ngOnInit() {
    this.isUserOrProjectLog = this.logService.getIsProjectLog();
    if (this.logService.getIsProjectLog()) {
      this.project = this.projectService.getSelectedProject();
      this.loadProjectLogs(this.project);
    } else {
      this.user = this.userService.getSelectedUser();
      console.log(this.user);
      this.loadUserLogs(this.user);
    }
  }

  loadProjectLogs(project: Project) {
    this.logDataService.getProjectLogs(project.projectID).subscribe(
      (logs) => {
        for (let log of logs) {
          log.description = this.translationHelper.getTranslatedLogDescription(
            log.activityName,
            log.description
          );
          console.log(log.description);
        }
        this.logs$ = of(logs);
      },
      (error) => {
        console.error('Error getting project logs:', error);
        // Optionally, notify the user about the error
      }
    );
  }

  loadUserLogs(user: User) {
    this.logDataService.getUserLogs(user.userID).subscribe(
      (logs) => {
        for (let log of logs) {
          log.description = this.translationHelper.getTranslatedLogDescription(
            log.activityName,
            log.description
          );
          console.log(log.description);
        }
        this.logs$ = of(logs);
      },
      (error) => {
        console.error('Error getting User logs:', error);
        // Optionally, notify the user about the error
      }
    );
  }
}
