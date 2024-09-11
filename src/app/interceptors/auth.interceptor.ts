import { Injectable, Injector } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private injector: Injector, private router: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authService = this.injector.get(AuthService); // Using injector to avoid direct circular dependency
    const authToken = authService.getToken();

    if (authToken) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}`
        }
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.router.navigate(['/login'], { queryParams: { returnUrl: request.url } });
          sessionStorage.clear();
        } else if (error.status === 403) {
          this.router.navigate(['/forbidden']);
        } else if (error.status === 500) {
          console.error(error);
        } else if (error.status === 0) {
          console.error(error);
          alert('Network error: Please check your internet connection.');
        } else {
          console.error(error);
        }
        return throwError(error);
      })
    );
  }
}
