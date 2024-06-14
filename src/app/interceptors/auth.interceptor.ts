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
          alert('Unauthorized access. Please log in.');
          this.router.navigate(['/login'], { queryParams: { returnUrl: request.url } });
        } else if (error.status === 403) {
          // Handle forbidden access
          this.authService.setAuthenticated(false);
          this.router.navigate(['/forbidden']); // Redirect to a forbidden page or handle accordingly
          alert('Your session has expired or you do not have permission to access this resource.');
        }
        return throwError(error);
      })
    );
  }
}
