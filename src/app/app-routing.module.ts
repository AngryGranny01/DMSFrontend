import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginPageComponent } from './login-page/login-page.component';
import { UserManagmentPageComponent } from './user-managment-page/user-managment-page.component';
import { UserProfilComponent } from './user-profil/user-profil.component';

const routes: Routes = [
  {path: 'login', component: LoginPageComponent},
  {path: 'userManagment', component: UserManagmentPageComponent},
  {path: 'profil', component: UserProfilComponent}
  //{ path: '**', component: PageNotFoundComponent },  // Wildcard route for a 404 page
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
