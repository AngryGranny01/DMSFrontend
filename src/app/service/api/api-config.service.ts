import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ApiConfigService {
  baseURL = 'http://localhost:8080/DMSSystem';

  encodeQueryString(params: any) {
    const keys = Object.keys(params);
    return keys.length
      ? '?' +
          keys
            .map(
              (key) =>
                encodeURIComponent(key) + '=' + encodeURIComponent(params[key])
            )
            .join('&')
      : '';
  }
}
