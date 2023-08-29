import { Component, OnDestroy, OnInit } from '@angular/core';
import { ClassService } from '../class.service';
import { Class } from '../class.model';
import { AuthService } from 'src/app/authorization/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { CreateUnitModalComponent } from 'src/app/unit-components/create-unit-modal/create-unit-modal.component';
import { Subscription } from 'rxjs';
import { Unit } from 'src/app/unit-components/unit.model';
import { UnitService } from 'src/app/unit-components/unit.service';

@Component({
  selector: 'app-assignments',
  templateUrl: './assignments.component.html',
  styleUrls: ['./assignments.component.css']
})
export class AssignmentsComponent implements OnInit, OnDestroy {

  classData: Class;
  isTeacher: boolean;
  classUpdateSubscription: Subscription;


  constructor(private dialog: MatDialog, private classService: ClassService, private unitService: UnitService, private authService: AuthService) { }

  ngOnInit(): void {
    this.classData = this.classService.getCurrentClass();
    console.log(this.classData);
    this.classUpdateSubscription = this.classService
      .getCurrentClassUpdateSubscription()
      .subscribe({
        next: (classData) => {
          this.classData = classData;
        },
      });


    this.isTeacher = this.authService.getIsTeacher();
  }

  onCreateUnit() {
    this.unitService.onCreateUnit(this.classData.id).subscribe({
      next: (newUnit) => {
        this.classData.units.push(newUnit);
      }
    })
  }

  onUnitDeleted(index: number) {
    this.classData.units.splice(index, 1);
  }

  ngOnDestroy(): void {
    this.classUpdateSubscription.unsubscribe();
  }

}
