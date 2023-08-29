import { Component, OnInit } from '@angular/core';
import { ClassStudentsService } from '../class-students.service';
import { Student } from '../student.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.css']
})
export class StudentsComponent implements OnInit {

  pendingStudents: Student [];
  classStudents: Student [];
  classId: number;

  constructor(private route: ActivatedRoute, private classStudentService: ClassStudentsService) { }

  ngOnInit(): void {

    //be careful, this might not work since child/nested route
    this.classId = this.route.snapshot.params["classId"];

    this.classStudentService.getStudents(this.classId).subscribe({
      next: (students) => {
        this.classStudents = students;

      }
    })

    this.classStudentService.getPendingStudents(this.classId).subscribe({
      next: (pendingStudents) => {
        this.pendingStudents = pendingStudents;
      }
    })

  }

  onApproveStudent(studentId: number, pendingIndex: number) {
    this.classStudentService.approvePendingStudent(this.classId, studentId).subscribe({
      next: (response) => {
        //remove from pending array and put on student array
        this.classStudents.push(this.pendingStudents[pendingIndex]);
        this.pendingStudents.splice(pendingIndex, 1);
      }
    })
  }

  onDeleteStudent(studentId: number, index: number, pending: boolean) {
    this.classStudentService.deleteStudent(this.classId, studentId).subscribe({
      next: (response) => {
        if(pending) {
          this.pendingStudents.splice(index, 1);
        }
        else {
          this.classStudents.splice(index, 1);
        }
      }
    })
  }

}
