import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginPageComponent } from './login-page/login-page.component';
import { UserManagmentPageComponent } from './user-managment-page/user-managment-page.component';
import { UserProfilComponent } from './user-profil/user-profil.component';
import { CreateProjectComponent } from './create-project/create-project.component';
import { LogsComponent } from './logs/logs.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './guard/auth.guard';
import { EmailPageComponent } from './email-page/email-page.component';
import { ForbiddenComponent } from './forbidden/forbidden.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { Role } from './models/roleEnum';

const routes: Routes = [
  { path: 'login', component: LoginPageComponent },
  {
    path: 'userManagment',
    component: UserManagmentPageComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.ADMIN] },
  },
  {
    path: 'profil',
    component: UserProfilComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.USER, Role.ADMIN, Role.PROJECT_MANAGER] },
  },
  {
    path: 'createProject',
    component: CreateProjectComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.ADMIN, Role.PROJECT_MANAGER] },
  },
  {
    path: 'logs',
    component: LogsComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.ADMIN] },
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  { path: 'setPassword', component: EmailPageComponent },
  { path: 'forbidden', component: ForbiddenComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
