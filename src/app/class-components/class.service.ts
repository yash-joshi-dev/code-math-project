import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../authorization/auth.service';
import { Class } from './class.model';
import { environment } from 'src/environments/environment';
import { Teacher } from './teacher.model';
import { Subject, map } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ShareClassModalComponent } from './classes/share-class-modal/share-class-modal.component';
import { EditClassModalComponent } from './classes/edit-class-modal/edit-class-modal.component';
import { ConfirmationModalComponent } from '../general/confirmation-modal/confirmation-modal.component';
import { string } from 'blockly/core/utils';
import { Unit } from '../unit-components/unit.model';
import { UnitService } from '../unit-components/unit.service';
import { DeleteClassModalComponent } from './classes/delete-class-modal/delete-class-modal.component';

@Injectable({ providedIn: 'root' })
export class ClassService {
  private currentClass: Class;
  private currentClassUpdate = new Subject<Class>();

  constructor(private unitService: UnitService, private dialog: MatDialog, private http: HttpClient) {}

  //------------------------------------------------------------------CLASS ACTIONS
  onShareClass(classData: Class) {
    const dialogRef = this.dialog.open(ShareClassModalComponent, {
      data: { classData: classData },
    });
    return dialogRef.afterClosed();
  }

  onEditClass(classData: Class) {
    const dialogRef = this.dialog.open(EditClassModalComponent, {
      data: { classData: classData },
    });
    return dialogRef.afterClosed();
  }

  onDeleteClass(classId: number) {
    const dialogRef = this.dialog.open(DeleteClassModalComponent, {
      data: {
        classId: classId
      }
    });

    return dialogRef.afterClosed();
  }

  //--------------------------------------------------------------------MAIN CLASS ROUTES

  getCurrentClass() {
    return this.currentClass;
  }

  getCurrentClassUpdateSubscription() {
    return this.currentClassUpdate.asObservable();
  }

  // setClassBasicData() {
  //   this.http
  //     .get<{code: string, name: string, teacherNames: string []}>(environment.BACKEND_URL + `/classes/basic/${this.currentClass.id}`)
  //     .subscribe({
  //       next: (response) => {
  //         this.currentClass.code = response.code;
  //         this.currentClass.name = response.name;
  //         this.currentClass.teacherNames = response.teacherNames;

  //         //maybe emit event
  //         // this.currentClassUpdate.next(this.currentClass);
  //       }
  //     })
  // }

  // setClassUnits() {
  //   this.unitService.getClassUnits(this.currentClass.id).subscribe({
  //     next: (units) => {
  //       this.currentClass.units = units;
        
  //         //maybe emit event
  //         // this.currentClassUpdate.next(this.currentClass);
  //     }
  //   })
  // }
  // updateCurrentClass() {
  //   return this.http
  //   .get<{ classData: any }>(environment.BACKEND_URL + '/classes/' + this.currentClass.id)
  //   .pipe(
  //     map((response) => {
  //       this.currentClass = new Class(response.classData);

  //       //emit an event to signify that class data updated
  //       this.currentClassUpdate.next(this.currentClass);

  //       //return true for the class guard to get
  //       return true;
  //     })
  //   );
  // }

  emitUpdateCurrentClassEvent() {
    this.currentClassUpdate.next(this.currentClass);
  }

  //set all class
  setClass(classId: number) {
    return this.http
      .get<{ classData: any }>(environment.BACKEND_URL + '/classes/' + classId)
      .pipe(
        map((response) => {
          this.currentClass = new Class(response.classData);

          //emit an event to signify that class data updated
          this.emitUpdateCurrentClassEvent();

          //return true for the class guard to get
          return true;
        })
      );
  }

  //get classes
  getClasses() {
    return this.http
      .get<{ classes: any [] }>(environment.BACKEND_URL + '/classes')
      .pipe(
        map((response) => {
          const classes: Class[] = [];
          response.classes.forEach((classData) => {
            classes.push(new Class(classData));
          });
          return classes;
        })
      );
  }

  createClass(name: string) {
    return this.http.post(environment.BACKEND_URL + '/classes', { name: name });
  }

  updateClass(
    classId: number,
    name: string,
    code: string,
    unitsMapping: number[]
  ) {
    const newClassData = {
      name: name,
      code: code,
      unitsMapping: unitsMapping,
    };

    return this.http.put(
      environment.BACKEND_URL + '/classes/' + classId,
      newClassData
    );
  }

  deleteClass(classId: number) {
    return this.http.delete(environment.BACKEND_URL + '/classes/' + classId);
  }

  //-----------------------------------------------------------CLASS OWNERSHIP ROUTES

  getClassTeachers(classId: number) {
    return this.http
      .get<{ teachers: any[] }>(
        environment.BACKEND_URL + '/class_owners/' + classId
      )
      .pipe(
        map((response) => {
          const teachers: Teacher[] = [];
          response.teachers.forEach((teacherData) => {
            teachers.push(new Teacher(teacherData));
          });
          return teachers;
        })
      );
  }

  shareClass(classId: number, teacherEmail: string, rights: string) {
    return this.http.post(
      environment.BACKEND_URL + '/class_owners/' + classId,
      { teacherEmail: teacherEmail, rights: rights }
    );
  }

  changeClassTeacherRights(classId: number, teacherId: number, rights: string) {
    return this.http.patch(
      environment.BACKEND_URL + `/class_owners/${classId}/${teacherId}`,
      { rights: rights }
    );
  }

  removeClassTeacher(classId: number, teacherId: number) {
    return this.http.delete(
      environment.BACKEND_URL + `/class_owners/${classId}/${teacherId}`
    );
  }
}
