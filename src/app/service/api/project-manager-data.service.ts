import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiConfigService } from './api-config.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectManagerDataService {
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
    private authService: AuthService
  ) {}

  //-------------------------------------------- Get-Requests --------------------------------------------------------------//

  /**
   * Updates the manager ID for projects associated with the given old manager ID to the new manager ID.
   * @param oldManagerID The ID of the old manager.
   * @param newManagerID The ID of the new manager.
   * @returns An Observable of the response.
   */
  updateManagerID(oldManagerID: number, newManagerID: number): Observable<any> {
    return this.http
      .put(
        `${this.apiConfig.baseURL}/project/projectManager`,
        {
          oldManagerID,
          newManagerID,
        },
        {
          headers: this.authService.getAuthHeaders(),
        }
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }
}
