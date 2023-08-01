import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {

  loginForm: FormGroup;
  isLoading = false;
  private authSub: Subscription;

  constructor(private route: ActivatedRoute, private authService: AuthService) { }

  ngOnInit(): void {

    this.loginForm = new FormGroup({
      'emailAddress': new FormControl(null, [Validators.required, Validators.email]),
      'password': new FormControl(null, [Validators.required])
    });

    this.authSub = this.authService.getAuthStatusListener().subscribe(
      isauth => {
        this.isLoading = false;
      }
    )


  }

  onLogin() {
    
    this.isLoading = true;
    this.authService.loginUser(this.loginForm.value);
    // this.loginForm.reset();

  }

  ngOnDestroy() {
    this.authSub.unsubscribe();
  }

}
