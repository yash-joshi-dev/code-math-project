import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../authorization/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {

  private authListenerSub: Subscription;
  userIsAuthenticated = false;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {

    this.userIsAuthenticated = this.authService.getIsAuthenticated();

    this.authListenerSub = this.authService.getAuthStatusListener().subscribe(
      isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
      }
    );

  }

  getName() {
    return this.authService.userData.name;
  }
  
  onLogout() {
    this.authService.logout();
  }

  ngOnDestroy(): void {
    this.authListenerSub.unsubscribe;
  }
}
