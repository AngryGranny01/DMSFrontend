import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginPageComponent } from './login-page/login-page.component';
import { UserManagmentPageComponent } from './user-managment-page/user-managment-page.component';
import { UserProfilComponent } from './user-profil/user-profil.component';
import { CreateProjectComponent } from './create-project/create-project.component';
import { LogsComponent } from './logs/logs.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './guard/auth.guard';

const routes: Routes = [
  {path: 'login', component: LoginPageComponent},
  {path: 'userManagment', component: UserManagmentPageComponent, canActivate: [AuthGuard]},
  {path: 'profil', component: UserProfilComponent, canActivate: [AuthGuard]},
  {path: 'createProject', component: CreateProjectComponent, canActivate: [AuthGuard]},
  {path: 'logs', component: LogsComponent, canActivate: [AuthGuard]},
  {path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard]},
  { path: '', redirectTo: '/login', pathMatch: 'full' } // Default redirect to login
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
