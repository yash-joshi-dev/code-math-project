import { Component, OnDestroy, OnInit } from '@angular/core';
import { ClassService } from '../class.service';
import { Subscription } from 'rxjs';
import { Class } from '../class.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-class-header',
  templateUrl: './class-header.component.html',
  styleUrls: ['./class-header.component.css'],
})
export class ClassHeaderComponent implements OnInit, OnDestroy {
  classData: Class;
  classUpdateSubscription: Subscription;

  constructor(private router: Router, private classService: ClassService) {}

  ngOnInit(): void {
    this.classData = this.classService.getCurrentClass();
    this.classUpdateSubscription = this.classService
      .getCurrentClassUpdateSubscription()
      .subscribe({
        next: (classData) => {
          this.classData = classData;
        },
      });
  }

  onEditClass() {
    this.classService.onEditClass(this.classData);
  }

  onShareClass() {
    this.classService.onShareClass(this.classData).subscribe({
      next: (teacherRemovedSelfFromClass) => {
        if(teacherRemovedSelfFromClass) {
          this.router.navigate(['/classes']);
        }
      }
    })
  }

  onDeleteClass() {
    this.classService.onDeleteClass(this.classData.id).subscribe({
      next: (classWasDeleted) => {
        if(classWasDeleted) {
          this.router.navigate(['/classes']);
        }
      }
    })
  }

  ngOnDestroy(): void {
    this.classUpdateSubscription.unsubscribe();
  }
}
