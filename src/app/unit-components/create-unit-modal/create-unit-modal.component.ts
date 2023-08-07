import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UnitService } from '../unit.service';
import { Unit } from '../unit.model';

@Component({
  selector: 'app-create-unit-modal',
  templateUrl: './create-unit-modal.component.html',
  styleUrls: ['./create-unit-modal.component.css']
})
export class CreateUnitModalComponent implements OnInit {

  createUnitForm: UntypedFormGroup;

  constructor(
    public dialogRef: MatDialogRef<CreateUnitModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { classId: number},
    private unitService: UnitService
  ) {}

  ngOnInit(): void {

    this.createUnitForm = new UntypedFormGroup({
      "name": new UntypedFormControl("", Validators.required),
      "isReleased": new UntypedFormControl(true)
    })
  }

  onSubmit() {
    
    if(this.data.classId) {
      
      //create a class unit
      this.unitService.createClassUnit(this.data.classId, this.createUnitForm.value.name, this.createUnitForm.value.isReleased).subscribe({
        next: (response) => {
          this.dialogRef.close(new Unit(response.newUnitData));
        }
      });

    }
    else {

      //create a unit individually

    }

  }

}
