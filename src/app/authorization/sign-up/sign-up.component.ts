import { HttpClient } from '@angular/common/http';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit, OnDestroy {

  title: string;
  userType: string;
  otherType: string;
  signUpForm: FormGroup;
  isLoading: boolean = false;
  private authSub: Subscription;

  constructor(private route: ActivatedRoute, private http: HttpClient, private authService: AuthService) { }

  ngOnInit(): void {
    this.route.params.subscribe(
      (params: Params) => {
        this.userType = params['userType'];
        if(this.userType === 'teacher') {
          this.otherType = 'student';
          this.title = "Teacher Sign-Up"
        }
        else if(this.userType = 'student') {
          this.otherType = 'teacher';
          this.title =  "Student Sign-Up";
        }
      }
    )

    //in case of getting an error, loading icon goes away
    this.authSub = this.authService.getAuthStatusListener().subscribe(
      authStatus => {
        this.isLoading = false;
      }
    )
    
    //signup form
    this.signUpForm = new FormGroup({
      'first_name': new FormControl(null, [Validators.required, Validators.maxLength(50)]),
      'last_name': new FormControl(null, [Validators.required, Validators.maxLength(50)]),
      'email_address': new FormControl(null, [Validators.required, Validators.email]),
      'password': new FormControl(null, [Validators.required])
    });
  }

  onSubmit() {
    this.isLoading = true;
    this.authService.createNewUser(this.signUpForm.value, this.userType);
    // this.signUpForm.reset();
  }

  ngOnDestroy() {
    this.authSub.unsubscribe();
  }
}
