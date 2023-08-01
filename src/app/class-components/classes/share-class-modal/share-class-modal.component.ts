import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EditClassModalComponent } from '../edit-class-modal/edit-class-modal.component';
import { ClassService } from '../../class.service';
import { Teacher } from '../../teacher.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-share-class-modal',
  templateUrl: './share-class-modal.component.html',
  styleUrls: ['./share-class-modal.component.css'],
})
export class ShareClassModalComponent implements OnInit {

  teachers: Teacher[];
  shareClassForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<EditClassModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { classId: number },
    private classService: ClassService
  ) {}

  ngOnInit(): void {

    //get all teachers for the class
    this.classService.getClassTeachers(this.data.classId).subscribe({
      next: (teachers) => {
        this.teachers = teachers;
      }
    })

    //have form to add a another teacher
    this.shareClassForm = new FormGroup({
      "emailAddress": new FormControl("", [Validators.required, Validators.email]),
      "rights": new FormControl("editing", [Validators.required])
    })
  }

  onSubmit() {
    console.log(this.shareClassForm.value);
  }
}
