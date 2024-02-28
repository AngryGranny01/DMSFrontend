import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginDropdownComponent } from './login-dropdown/login-dropdown.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { UserManagmentPageComponent } from './user-managment-page/user-managment-page.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginDropdownComponent,
    LoginPageComponent,
    UserManagmentPageComponent,
    HeaderComponent,
    FooterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
