import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/authorization/auth.service';
import { Class } from '../../class.model';

@Component({
  selector: 'app-class-header',
  templateUrl: './class-header.component.html',
  styleUrls: ['./class-header.component.css']
})
export class ClassHeaderComponent implements OnInit {

  isTeacher = false;

  @Input() classData: Class;

  constructor(private authService: AuthService) {
    this.isTeacher = authService.getIsTeacher();
   }

  ngOnInit(): void {
  }

}
