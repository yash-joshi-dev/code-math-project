import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Unit } from '../unit.model';
import { UnitService } from '../unit.service';
import { AuthService } from 'src/app/authorization/auth.service';
import { ContentService } from 'src/app/content-components/content.service';

@Component({
  selector: 'app-unit',
  templateUrl: './unit.component.html',
  styleUrls: ['./unit.component.css']
})
export class UnitComponent implements OnInit {

  @Input() unitData: Unit;
  @Input() studentProgressView: boolean = false;
  @Output() unitDeleted = new EventEmitter<boolean>();
  isTeacher: boolean;
  

  constructor(private contentService: ContentService, private unitService: UnitService, private authService: AuthService) { }

  ngOnInit(): void {
    this.isTeacher = this.authService.getIsTeacher();
  }

  onCreateNewLesson() {
    this.contentService.onCreateLesson(this.unitData.id).subscribe({
      next: (newContent) => {
        this.unitData.content.push(newContent);
      }
    })
  }

  onContentDeleted(index: number) {
    this.unitData.content.splice(index, 1);
  }

  onViewUnitProgress() {
    //TODO later
  }

  onEditUnit() {
    this.unitService.onEditUnit(this.unitData);
  }
  
  onDeleteUnit() {
    this.unitService.onDeleteUnit(this.unitData.id).subscribe({
      next: (unitWasDeleted) => {
        //emit event to notify parent that the unit was deleted (so UI can be updated)
        if(unitWasDeleted) {this.unitDeleted.emit(true);}
      }
    })
  }

}
