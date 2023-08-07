import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EditClassModalComponent } from '../edit-class-modal/edit-class-modal.component';
import { ClassService } from '../../class.service';
import { Teacher } from '../../teacher.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Class } from '../../class.model';
import { AuthService } from 'src/app/authorization/auth.service';

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
    public dialogRef: MatDialogRef<ShareClassModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { classData: Class },
    private classService: ClassService,
    private authService: AuthService
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
    this.classService.getClassTeachers(this.data.classData.id).subscribe({
      next: (teachers) => {
        this.teachers = teachers;
      },
    });
  }

  onSubmit() {
    this.classService.shareClass(this.data.classData.id, this.shareClassForm.value.emailAddress, this.shareClassForm.value.rights).subscribe({
      next: (response) => {
        this.setTeachers();
      }
    })
  }

  removeTeacher(teacher: Teacher) {
    this.classService.removeClassTeacher(this.data.classData.id, teacher.id).subscribe({
      next: (response) => {

        //if teacher deleted themselves, immediately close the popup with true flag
        if(teacher.id === this.authService.getUserData().id) {
          this.dialogRef.close(true);
        }
        else {
          this.setTeachers();
        }
      }
    })
  }

  onSave() {

    //set the current teachers in the class to the teachers here
    this.data.classData.teacherNames = this.teachers.map((teacherData) => teacherData.name);

    //close dialog
    this.dialogRef.close(false);

  }

}
