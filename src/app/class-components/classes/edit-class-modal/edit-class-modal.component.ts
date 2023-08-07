import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Class } from '../../class.model';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Unit } from 'src/app/unit-components/unit.model';
import { ClassService } from '../../class.service';

@Component({
  selector: 'app-edit-class-modal',
  templateUrl: './edit-class-modal.component.html',
  styleUrls: ['./edit-class-modal.component.css'],
})
export class EditClassModalComponent implements OnInit {
  editClassForm: FormGroup;
  units: Unit[];
  classData: Class;

  constructor(
    public dialogRef: MatDialogRef<EditClassModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { classData: Class },
    private classService: ClassService
  ) {}

  ngOnInit(): void {
    this.classData = this.data.classData;
    this.units = [...this.classData.units];

    this.editClassForm = new FormGroup({
      name: new FormControl(this.classData.name, [
        Validators.required,
        Validators.maxLength(255),
      ]),
      code: new FormControl(this.classData.code, [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(10),
      ]),
    });
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.units, event.previousIndex, event.currentIndex);
  }

  onSubmit() {

    //create list of new order of unit ids
    let unitsMapping = [];
    this.units.forEach((unit) => {
      unitsMapping.push(unit.id);
    })

    //update class in database
    this.classService.updateClass(this.classData.id, this.editClassForm.value.name, this.editClassForm.value.code, unitsMapping).subscribe({
      next: (response) => {
        
        //update existing values of class
        this.classData.name = this.editClassForm.value.name;
        this.classData.code = this.editClassForm.value.code;
        this.classData.units = this.units;

        //close finally
        this.dialogRef.close();
      }
    })

  }
}
