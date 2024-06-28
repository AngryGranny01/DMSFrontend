import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authToken = this.authService.getToken();

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
          // Handle unauthorized access
          this.authService.setAuthenticated(false);
          this.router.navigate(['/login'], { queryParams: { returnUrl: request.url } });
        } else if (error.status === 403) {
          // Handle forbidden access
          this.router.navigate(['/forbidden']); // Redirect to a forbidden page or handle accordingly
          alert('Your session has expired or you do not have permission to access this resource.');
        } else if (error.status === 500) {
          // Handle server errors
          console.error(error)
        } else if (error.status === 0) {
          // Handle network errors
          console.error(error)
          alert('Network error: Please check your internet connection.');
        } else {
          // Handle other types of error
        }
        return throwError(error);
      })
    );
  }
}
