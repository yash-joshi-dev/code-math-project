import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { AuthService } from '../authorization/auth.service';
import { ClassStudentsService } from './class-students.service';
import { Class } from './class.model';
import { ClassesService } from './classes.service';

@Component({
  selector: 'app-classes',
  templateUrl: './classes.component.html',
  styleUrls: ['./classes.component.css']
})
export class ClassesComponent implements OnInit, OnDestroy {

  classes: Class [];
  deleteClassSubscription: Subscription;
  isTeacher: boolean = false;

  constructor(private classesService: ClassesService, private authService: AuthService, private classStudentsService: ClassStudentsService, private dialog: MatDialog) { }

  ngOnInit(): void {

    this.classesService.getClasses().subscribe(
      (response) => {
        this.classes = response.classes;
      }
    );

    this.isTeacher = this.authService.getIsTeacher();
    
  }

  onCreateClass() {

    const dialogRef = this.dialog.open(NewClassFormComponent, {width: '400px', data: {action: "Create", className: "", teacherName: this.authService.userData.name}})

    dialogRef.afterClosed().subscribe(
      result => {
        if(result) this.classes.push(result.classData);
      }
    )

  }

  onEditClass(i: number) {

    const dialogRef = this.dialog.open(NewClassFormComponent, {width: '400px', data: {action: "Edit", className: this.classes[i].name, teacherName: this.classes[i].teacher_name, classId: this.classes[i].id}})

    dialogRef.afterClosed().subscribe(
      result => {
        if(result) {
          this.classes[i].name = result.newClassName;
          this.classes[i].teacher_name = result.newTeacherName;
        }
      }
    )

  }

  onDeleteClass(i: number) {

    let classId = this.classes[i].id;
    this.deleteClassSubscription = this.classesService.deleteClass(classId).subscribe(
      result => {
        this.classes.splice(i, 1);
      }
    )

  }

  ngOnDestroy(): void {
    if(this.deleteClassSubscription) {this.deleteClassSubscription.unsubscribe();}
  }

  onJoinClass(): void {

    //remember to add something so can't add student twice

    const dialogRef = this.dialog.open(JoinClassFormComponent);

    dialogRef.afterClosed().subscribe(
      result => {
        if(result && result.length > 0) {
          this.classStudentsService.addPendingStudent(result).subscribe(
            response => {
              this.dialog.open(JoinConfirmationComponent);
            }
          );
        }
      }
    )

  }

}

@Component({
  selector: 'join-class-form',
  templateUrl: './join-class-form.component.html',
})
export class JoinClassFormComponent {
  public classCode;
}

@Component({
  selector: 'join-confirmation',
  templateUrl: './join-confirmation.component.html',
})
export class JoinConfirmationComponent {}

@Component({
  selector: 'new-class-form',
  templateUrl: './new-class-form.component.html',
})
export class NewClassFormComponent implements OnInit, OnDestroy{

  classForm: FormGroup;
  createClassSubscription: Subscription;
  editClassSubscription: Subscription;

  constructor(
    public dialogRef: MatDialogRef<NewClassFormComponent>,
    private classesService: ClassesService,
    @Inject(MAT_DIALOG_DATA) public data: {action: string, className: string, teacherName: string, classId: number}
  ) {}

  ngOnInit(): void {

    //create a form
    this.classForm = new FormGroup({
      'class_name': new FormControl(this.data.className, [Validators.required]),
      'teacher_name': new FormControl(this.data.teacherName, [Validators.required])
    });

  }

  onSubmit() {

    if(this.data.action === "Create") {
      this.createClassSubscription = this.classesService.createClass(this.classForm.value.class_name, this.classForm.value.teacher_name).subscribe(
        result => {
          this.dialogRef.close(result);
        }
      );
    }
    else if(this.data.action === "Edit") {
      this.editClassSubscription = this.classesService.editClass(this.classForm.value.class_name, this.classForm.value.teacher_name, this.data.classId).subscribe(
        result => {
          this.dialogRef.close(
            {
              newClassName: this.classForm.value.class_name,
              newTeacherName: this.classForm.value.teacher_name
            }
          );
        }
      );
    }

  }

  ngOnDestroy(): void {
    if(this.editClassSubscription) this.editClassSubscription.unsubscribe();
    if(this.createClassSubscription) this.createClassSubscription.unsubscribe();
  }

}