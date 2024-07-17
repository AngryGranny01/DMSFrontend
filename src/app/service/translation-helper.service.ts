import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Action } from '../models/logActionEnum';
import { Target } from '../models/logTargetEnum';
import { Log } from '../models/logInterface';

@Injectable({
  providedIn: 'root',
})
export class TranslationHelperService {
  constructor(private translate: TranslateService) {}

  translateLog(log: Log): string {
    let translationKey = '';

    switch (log.action) {
      case Action.LOGIN:
        translationKey = 'LOGIN';
        break;
      case Action.LOGOUT:
        translationKey = 'LOGOUT';
        break;
      case Action.CREATE:
        if (log.target === Target.ACCOUNT || log.target === Target.PERSON) {
          translationKey = 'CREATE_USER';
        } else if (log.target === Target.PROJECT) {
          translationKey = 'CREATE_PROJECT';
        } else if (log.target === Target.PASSWORD) {
          translationKey = 'CREATE_PASSWORD';
        }
        break;
      case Action.UPDATE:
        if (log.target === Target.ACCOUNT || log.target === Target.PERSON) {
          translationKey = 'UPDATE_USER';
        } else if (log.target === Target.PROJECT) {
          translationKey = 'UPDATE_PROJECT';
        } else if (log.target === Target.PASSWORD) {
          translationKey = 'UPDATE_PASSWORD';
        }
        break;
      case Action.DELETE:
        if (log.target === Target.ACCOUNT || log.target === Target.PERSON) {
          translationKey = 'DELETE_USER';
        } else if (log.target === Target.PROJECT) {
          translationKey = 'DELETE_PROJECT';
        }
        break;
      case Action.ERROR:
        translationKey = 'ERROR';
        break;
      default:
        translationKey = log.action;
    }

    return this.translate.instant(translationKey, {
      actorID: log.userID,
      targetID: log.targetID,
      field: log.field,
      value: log.value,
      actorRole: log.currentActorRole
    });
  }
}
