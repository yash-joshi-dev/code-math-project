import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Content } from 'src/app/content-components/content.model';
import { Unit } from '../unit.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UnitService } from '../unit.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-edit-unit-modal',
  templateUrl: './edit-unit-modal.component.html',
  styleUrls: ['./edit-unit-modal.component.css']
})
export class EditUnitModalComponent implements OnInit {

  editUnitForm: UntypedFormGroup;
  content: Content[];
  unitData: Unit;

  constructor(
    public dialogRef: MatDialogRef<EditUnitModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { unitData: Unit },
    private unitService: UnitService
  ) {}

  ngOnInit(): void {
    this.unitData = this.data.unitData;
    console.log(this.unitData);
    this.content = this.unitData.content;

    this.editUnitForm = new UntypedFormGroup({
      "name": new UntypedFormControl(this.unitData.name, [
        Validators.required,
        Validators.maxLength(255),
      ]),
      "isReleased": new UntypedFormControl(this.unitData.isReleased)
    });
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.content, event.previousIndex, event.currentIndex);
  }

  onSubmit() {

    //create list of new order of unit ids
    let contentMapping = [];
    this.content.forEach((content) => {
      contentMapping.push(content.id);
    })

    //update class in database
    this.unitService.updateUnit(this.unitData.id, this.editUnitForm.value.name, this.editUnitForm.value.isReleased, contentMapping).subscribe({
      next: (response) => {
        
        //update existing values of class
        this.unitData.name = this.editUnitForm.value.name;
        this.unitData.isReleased = this.editUnitForm.value.isReleased;

        //close finally
        this.dialogRef.close();
      }
    })

  }
}
