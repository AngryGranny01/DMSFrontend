import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LogDescriptionValues } from '../models/logDescriptionValues';

@Injectable({
  providedIn: 'root',
})
export class TranslationHelperService {

  constructor(private translate: TranslateService) {}

  /**
   * Retrieves the translated log description based on the provided values.
   * @param values The string representation of log description values.
   * @returns The translated log description values.
   */
  getTranslatedLogDescription(values: string): LogDescriptionValues {
    const description = LogDescriptionValues.fromString(values)
    return description;
  }
}
