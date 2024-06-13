import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ApiConfigService {
  baseURL = 'https://localhost:8080/DMSSystemAPI';
}
