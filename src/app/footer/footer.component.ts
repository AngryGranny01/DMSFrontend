import { Component } from '@angular/core';
import { AuthService } from '../service/auth.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  constructor(private authService: AuthService,){}

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}
