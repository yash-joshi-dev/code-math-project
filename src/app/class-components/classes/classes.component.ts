import { Component, OnInit, TemplateRef, ViewChild, OnDestroy } from '@angular/core';
import { Class } from '../class.model';
import { ClassService } from '../class.service';
import { AuthService } from 'src/app/authorization/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { ConfirmationModalComponent } from 'src/app/general/confirmation-modal/confirmation-modal.component';
import { CryptoService } from 'src/app/general/crypto.service';
import { EditClassModalComponent } from './edit-class-modal/edit-class-modal.component';
import { ShareClassModalComponent } from './share-class-modal/share-class-modal.component';
import { ClassStudentsService } from '../class-students.service';

@Component({
  selector: 'app-classes',
  templateUrl: './classes.component.html',
  styleUrls: ['./classes.component.css']
})
export class ClassesComponent implements OnInit, OnDestroy {

  @ViewChild('joinClassTemplate') joinClassTemplate: TemplateRef<any>;
  @ViewChild('createClassTemplate') createClassTemplate: TemplateRef<any>;

  classes: Class[];
  isTeacher: boolean;  

  constructor(private dialog: MatDialog, private classStudentsService: ClassStudentsService, private classService: ClassService, private authService: AuthService, private cryptoService: CryptoService) { }

  ngOnInit(): void {

    //check if person teacher
    this.isTeacher = this.authService.getIsTeacher();

    //get all classes for person
    this.setClasses();


  }

  setClasses() {
    this.classService.getClasses().subscribe({
      next: (classes) => {
        this.classes = classes;
      },
    });
  }

  getOwnedClasses() {
    return this.classes.filter((classData) => classData.isOwner === undefined || classData.isOwner);
  }

  getSharedClasses() {
    return this.classes.filter((classData) => classData.isOwner !== undefined && !classData.isOwner);
  }

  onJoinClass() {

    const dialogRef = this.dialog.open(this.joinClassTemplate);
    dialogRef.afterClosed().subscribe({
      next: (classCode) => {
        if(classCode.length > 0) {
          //call route for making a person join a class
            this.classStudentsService.addPendingStudent(classCode).subscribe((response) => {});
        }
      }
    })

  }

  onCreateClass() {
    const dialogRef = this.dialog.open(this.createClassTemplate);
    dialogRef.afterClosed().subscribe({
      next: (className) => {
        if(className.length > 0) {
          this.classService.createClass(className).subscribe({
            next: (response) => {
              this.setClasses();
            }
          })
        }
      }
    })
  }

  onShareClass(classData: Class) {

    const dialogRef = this.dialog.open(ShareClassModalComponent, {
      data: { classId: classData.id },
    });
    dialogRef.afterClosed().subscribe({
      next: (response) => {
        console.log('YAYAYAYYAYYAY');
      },
    });

  }

  onEditClass(classData: Class) {
    const dialogRef = this.dialog.open(EditClassModalComponent, {data: {classData: classData}});
    dialogRef.afterClosed().subscribe({
      next: (response) => {
        console.log("YAYAYAYYAYYAY");
      }
    })

  }

  onDeleteClass(classData: Class) {
    const dialogRef = this.dialog.open(ConfirmationModalComponent, 
      {data: {
        title: "Are you sure you want to delete this class?",
        body: "All class data will be deleted and students will be removed. Units will still remain in the libary."
      }});

    dialogRef.afterClosed().subscribe({
      next: (canDelete) => {
        if(canDelete) {
          this.classService.deleteClass(classData.id).subscribe({
            next: (response) => {
              this.setClasses();
            }
          })
        }
      }
    })
  }

  onClassCardClicked(classData: Class) {
    //navigate to the specic class home page (assignments page or something)
    //remember to store current class state in class service
    console.log(this.cryptoService.encryptMessage(classData.id.toString()));
    
  }

  //on classes page, should be able to:
  //for student, view all classes
    //join a class
    //cannot remove themselves from a class (so no deleting allowed for them or editing)
  //for teacher, view their own classes and shared classes?
    //create class
    //can edit and delete class
    //can view people that a class is shared with and share with other people, or remove other people (if they are owner?)
  
  ngOnDestroy(): void {
  }

}
