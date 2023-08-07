import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/authorization/auth.service';

@Component({
  selector: 'app-class',
  templateUrl: './class.component.html',
  styleUrls: ['./class.component.css']
})
export class ClassComponent implements OnInit {

  isTeacher: boolean;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.isTeacher = this.authService.getIsTeacher();
  }

}
