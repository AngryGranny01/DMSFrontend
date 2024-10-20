import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { UserManagmentPageComponent } from './user-managment-page/user-managment-page.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { NavbarComponent } from './navbar/navbar.component';
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  HttpClientModule,
} from '@angular/common/http';
import { UserProfilComponent } from './user-profil/user-profil.component';
import { CreateProjectComponent } from './create-project/create-project.component';
import { LogsComponent } from './logs/logs.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { EmailPageComponent } from './email-page/email-page.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { ForbiddenComponent } from './forbidden/forbidden.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';


export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    AppComponent,
    LoginPageComponent,
    UserManagmentPageComponent,
    SidebarComponent,
    NavbarComponent,
    UserProfilComponent,
    CreateProjectComponent,
    LogsComponent,
    DashboardComponent,
    EmailPageComponent,
    ForbiddenComponent,
    PageNotFoundComponent,
  ],
  imports: [
    BrowserModule,
    MatIconModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    BsDatepickerModule.forRoot(),
    HttpClientModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatMenuModule,
    MatButtonModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    provideAnimationsAsync('noop'),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
