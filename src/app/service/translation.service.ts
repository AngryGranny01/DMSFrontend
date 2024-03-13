import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  constructor(private translate: TranslateService) {}

  translateStringWithPlaceholders(
    key: string,
    placeholders: { [key: string]: any }
  ): string {
    let translatedString = this.translate.instant(key); // Translate the string
    const matches = translatedString.match(/\$\$(.*?)\$\$/g); // Extract placeholders between $$ symbols

    if (matches) {
      matches.forEach((match: string) => {
        // Specify the type explicitly for 'match'
        const placeholder = match.slice(2, -2); // Remove $$ symbols
        if (placeholders.hasOwnProperty(placeholder)) {
          const value = placeholders[placeholder];
          translatedString = translatedString.replace(match, value); // Replace placeholder with its value
        }
      });
    }

    return translatedString;
  }

  insertValuesBetweenPlaceholders(
    inputString: string,
    values: { [key: string]: any }
  ): string {
    let resultString = inputString;

    // Iterate over each key-value pair in the 'values' object
    Object.entries(values).forEach(([key, value]) => {
      // Create a regular expression to find all occurrences of the placeholder
      const regex = new RegExp(`\\$\\$${key}\\$\\$`, 'g');
      // Replace all occurrences of the placeholder with the corresponding value
      resultString = resultString.replace(regex, `$$${value}$$`);
    });

    return resultString;
  }
}
