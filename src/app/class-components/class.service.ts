import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../authorization/auth.service';
import { Class } from './class.model';
import { environment } from 'src/environments/environment';
import { Teacher } from './teacher.model';
import { map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ClassService {
  public currentClassId: number;

  constructor(private http: HttpClient, private authService: AuthService) {}

  //--------------------------------------------------------------------MAIN CLASS ROUTES

  //get classes
  getClasses() {
    return this.http
      .get<{ classes: [any] }>(environment.BACKEND_URL + '/classes')
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

  //get class
  getClass(classId: number) {
    return this.http
      .get<{ classData: any }>(environment.BACKEND_URL + '/classes/' + classId)
      .pipe(map((response) => new Class(response.classData)));
  }

  createClass(name: string) {
    return this.http.post(environment.BACKEND_URL + '/classes', { name: name });
  }

  updateClass(
    classId: number,
    name: string,
    code: string,
    unitsMapping: number []
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
