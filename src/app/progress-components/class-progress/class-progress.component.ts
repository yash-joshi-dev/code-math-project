import { Component, OnInit } from '@angular/core';
import { ProgressService } from '../progress.service';
import { ClassStudentsService } from 'src/app/class-components/class-students.service';
import { StudentProgressRecord } from '../student-progress-record.model';
import { ClassService } from 'src/app/class-components/class.service';
import { Student } from 'src/app/class-components/student.model';
import { MatTableDataSource } from '@angular/material/table';
import { Unit } from 'src/app/unit-components/unit.model';
import { Class } from 'src/app/class-components/class.model';

@Component({
  selector: 'app-class-progress',
  templateUrl: './class-progress.component.html',
  styleUrls: ['./class-progress.component.css']
})
export class ClassProgressComponent implements OnInit {

  studentProgress: StudentProgressRecord [][][];
  classData: Class;
  students: Student[];
  releasedUnits: Unit[];

  // students: string [] = ['Student A', 'Student B', 'Student C'];
  // problems: string[] = ['Problem 1', 'Problem 2', 'Problem 3'];
  
  // Example status data matrix (replace with your actual data)
  // statusMatrix: string[][] = [
  //   ['done', 'timelapse', 'radio_button_unchecked'],
  //   ['timelapse', 'radio_button_unchecked', 'done'],
  //   ['done', 'timelapse', 'done']
  // ];

  // dataSource; // = new MatTableDataSource(this.statusMatrix);
  displayedColumns: string[]; // = ['Problem', ...this.students];

  constructor(private progressService: ProgressService, private classStudentService: ClassStudentsService, private classService: ClassService) { }

  ngOnInit(): void {

    console.log("hello");

    this.classData = this.classService.getCurrentClass();
    console.log("something");
    this.classStudentService.getStudents(this.classData.id).subscribe({
      next: (students) => {
        this.students = students;
        this.displayedColumns = ["Problems", ...(this.students.map((student) => student.name))];

        //get all the released units
        this.releasedUnits = this.classData.units.filter((unit) => unit.isReleased && unit.content.length > 0);
        //get all student progress
        this.progressService.getClassProgress().subscribe({
          next: (studentProgress) => {
            this.studentProgress = studentProgress;        
          }
        })

      }
    })


  }
onClick() {
  console.log("somethign");
}

getDataSource(unitIndex: number) {
  console.log(this.studentProgress[unitIndex])
  return new MatTableDataSource(this.studentProgress[unitIndex]);
}


}
