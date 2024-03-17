import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { User } from '../../models/userInterface';
import { ApiConfigService } from './api-config.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ProjectManagerDataService {
  constructor(private http: HttpClient, private apiConfig: ApiConfigService) {}

  //-------------------------------------------- Get-Requests --------------------------------------------------------------//
  getManagerAndAdminPassword(userID: number): Observable<any> {
    return this.http
      .get(`${this.apiConfig.baseURL}/projectAdminAndManager/passwords/${userID}`)
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getManagerID(userID: number): Observable<number> {
    return this.http
      .get(`${this.apiConfig.baseURL}/projectAdminAndManager/passwords/${userID}`)
      .pipe(
        map((response: any) => {
          return response.managerID;
        })
      );
  }
  //-------------------------------------------- Put-Requests --------------------------------------------------------------//
  updateManagerID(userID: number, managerID: number): Observable<boolean> {
    const params = new HttpParams()
      .set('userID', userID.toString())
      .set('managerID', managerID.toString());

    return this.http
      .put(`${this.apiConfig.baseURL}/projectManager`, null, { params })
      .pipe(
        map(() => true), // Assuming success if there's no error
        catchError(() => {
          return of(false); // Return false if an error occurs
        })
      );
  }

  //-------------------------------------------- Delete-Requests --------------------------------------------------------------//
  deleteProjectManager(managerID: number) {
    const params = new HttpParams().set('managerID', managerID.toString());

    return this.http.delete(`${this.apiConfig.baseURL}/projectManager`, {
      params,
    });
  }
}
