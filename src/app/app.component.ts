import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'DMSFrontend';
  constructor(private translate: TranslateService) {
    this.translate.setDefaultLang('en'); // Set default language
  }

  switchLanguage(lang: string) {
    this.translate.use(lang); // Switch language
  }
}
