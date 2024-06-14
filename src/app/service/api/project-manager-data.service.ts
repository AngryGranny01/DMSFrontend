import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiConfigService } from './api-config.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ProjectManagerDataService {
  constructor(private http: HttpClient, private apiConfig: ApiConfigService) {}

  //-------------------------------------------- Get-Requests --------------------------------------------------------------//

  /**
   * Retrieves the manager ID associated with the given user ID.
   * @param userID The ID of the user.
   * @returns An Observable of the manager ID.
   */
  getManagerID(userID: number): Observable<number> {
    return this.http
      .get(
        `${this.apiConfig.baseURL}/projectManager/${userID}`
      )
      .pipe(
        map((response: any) => {
          return response.managerID;
        })
      );
  }

  //-------------------------------------------- Put-Requests --------------------------------------------------------------//

  /**
   * Updates the manager ID associated with the given user ID.
   * @param userID The ID of the user.
   * @param managerID The ID of the manager to be updated.
   * @returns An Observable of a boolean value indicating the success of the operation.
   */
  updateManagerID(userID: number, managerID: number): Observable<boolean> {
    const params = new HttpParams()
      .set('userID', userID.toString())
      .set('managerID', managerID.toString());

    return this.http
      .put(`${this.apiConfig.baseURL}/projectManager`, null, { params })
      .pipe(
        map(() => true),
        catchError(() => {
          return of(false);
        })
      );
  }

  //-------------------------------------------- Delete-Requests --------------------------------------------------------------//

  /**
   * Deletes a project manager.
   * @param managerID The ID of the manager to be deleted.
   * @returns An Observable representing the HTTP response.
   */
  deleteProjectManager(managerID: number) {
    const params = new HttpParams().set('managerID', managerID.toString());

    return this.http.delete(`${this.apiConfig.baseURL}/projectManager`, {
      params,
    });
  }
}
