import { Component, OnInit } from '@angular/core';
import { ProgressService } from '../progress.service';
import { Unit } from 'src/app/unit-components/unit.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-student-progress',
  templateUrl: './student-progress.component.html',
  styleUrls: ['./student-progress.component.css']
})
export class StudentProgressComponent implements OnInit {

  studentProgressUnits: Unit [];
  studentId: number;

  constructor(private progressService: ProgressService, private route: ActivatedRoute) { }

  ngOnInit(): void {

    this.studentId = parseInt(this.route.snapshot.params["studentId"]);
    this.setUnits();

    
    this.route.params.subscribe({
      next: (params) => {
        this.studentId = parseInt(params["studentId"]);
        this.setUnits();
      }
    })

  }

  setUnits() {

    this.progressService.getStudentProgress(this.studentId).subscribe({
      next: (response) => {
        this.studentProgressUnits = response;
      }
    })

  }

}

