import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/authorization/auth.service';
import { UserData } from 'src/app/authorization/user-data.model';
import { Class } from '../../class.model';
import { ClassesService } from '../../classes.service';
import { ClassStudentsService } from '../../class-students.service';
import { ClassStudent } from '../../class-student.model';

@Component({
  selector: 'app-class-list',
  templateUrl: './class-list.component.html',
  styleUrls: ['./class-list.component.css']
})
export class ClassListComponent implements OnInit {

  pendingStudents: ClassStudent [];
  classStudents: ClassStudent [];
  classId: number;
  userRole: string; 

  //add approve all functionality and maybe only selecting stuff

  constructor(private route: ActivatedRoute, private studentService: ClassStudentsService, private authService: AuthService) { }

  ngOnInit(): void {

    //get role
    this.userRole = this.authService.userData.role;

    //get id from params
    this.classId = this.route.parent.snapshot.params['class_id'];

    //get all pending students
    this.studentService.getPendingStudents(this.classId).subscribe(
      response => {
        this.pendingStudents = response.pendingStudents;
      }
    )
    
    //get all class students
    this.studentService.getClassStudents(this.classId).subscribe(
      response => {
        this.classStudents = response.students;
      }
    );

  }

  onApprovePending(index: number) {
    
    this.studentService.approveClassStudent(this.classId, this.pendingStudents[index].id).subscribe(
      result => {

        const student = this.pendingStudents[index];

        //insert alphabetically
        for(var i = 0; i <= this.classStudents.length; i++) {
    
          if(i === this.classStudents.length) {
            this.classStudents.push(student);
            break;
          }
          else if(this.classStudents[i].name.localeCompare(student.name) === 1) {
            this.classStudents.splice(i, 0, student);
            break;
          }
    
    
        }
        this.pendingStudents.splice(index, 1);

      }
    );
    
  }

  onRemoveStudent(index: number) {
    this.studentService.deleteClassStudent(this.classId, this.pendingStudents[index].id).subscribe(
      result => {
        this.pendingStudents.splice(index, 1);
      }
    )
  }



}
