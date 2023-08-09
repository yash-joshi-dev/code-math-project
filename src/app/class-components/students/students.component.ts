import { Component, OnInit } from '@angular/core';
import { ClassStudentsService } from '../class-students.service';

@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.css']
})
export class StudentsComponent implements OnInit {

  constructor(private classStudentService: ClassStudentsService) { }

  ngOnInit(): void {

    

  }

}
