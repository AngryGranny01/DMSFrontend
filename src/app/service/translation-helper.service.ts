import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ActivityName } from '../models/activityName';
import { logDescriptionValues } from '../models/logInterface';
import { LogDescriptionValues } from '../models/logDescriptionValues';

@Injectable({
  providedIn: 'root',
})
export class TranslationHelperService {

  constructor(private translate: TranslateService) {}

  // Method to get translated log description based on activity name and provided values
  getTranslatedLogDescription(activity: ActivityName, values: string): string {
    let description = LogDescriptionValues.fromString(values,activity)
    return this.translate.instant(activity, description);
  }
}
