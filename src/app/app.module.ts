import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { UserManagmentPageComponent } from './user-managment-page/user-managment-page.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { NavbarComponent } from './navbar/navbar.component';
import { HttpClientModule } from '@angular/common/http';
import { UserProfilComponent } from './user-profil/user-profil.component';
import { CreateProjectComponent } from './create-project/create-project.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginPageComponent,
    UserManagmentPageComponent,
    SidebarComponent,
    NavbarComponent,
    UserProfilComponent,
    CreateProjectComponent,
  ],
  imports: [
    BrowserModule,
    MatIconModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
