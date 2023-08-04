import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EditClassModalComponent } from '../edit-class-modal/edit-class-modal.component';
import { ClassService } from '../../class.service';
import { Teacher } from '../../teacher.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-share-class-modal',
  templateUrl: './share-class-modal.component.html',
  styleUrls: ['./share-class-modal.component.css', './share-class-modal.component.less'],
})
export class ShareClassModalComponent implements OnInit {

  teachers: Teacher[];
  shareClassForm: FormGroup;
  readonly columns: string[] = ['name', 'email', 'access', 'actions'];

  constructor(
    public dialogRef: MatDialogRef<EditClassModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { classId: number },
    private classService: ClassService
  ) {}

  ngOnInit(): void {

    //set teachers
    this.setTeachers();

    //have form to add a another teacher
    this.shareClassForm = new FormGroup({
      "emailAddress": new FormControl("", [Validators.required, Validators.email]),
      "rights": new FormControl("editing", [Validators.required])
    })
  }

  setTeachers() {
    //get all teachers for the class
    this.classService.getClassTeachers(this.data.classId).subscribe({
      next: (teachers) => {
        this.teachers = teachers;
      },
    });
  }

  onSubmit() {
    this.classService.shareClass(this.data.classId, this.shareClassForm.value.emailAddress, this.shareClassForm.value.rights).subscribe({
      next: (response) => {
        this.setTeachers();
      }
    })
  }

  removeTeacher(teacher: Teacher) {
    this.classService.removeClassTeacher(this.data.classId, teacher.id).subscribe({
      next: (response) => {
        this.setTeachers();
      }
    })
  }

}
