import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Student } from './student.model';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ClassStudentsService {
  constructor(private http: HttpClient) {}

  //get all students
  getStudents(classId: number) {
    return this.http.get<{ students: Student[] }>(
      environment.BACKEND_URL + `/class_students/${classId}`
    ).pipe(map((response) => {
      const students = [];
      response.students.forEach(studentData => {
        students.push(new Student(studentData));
      });
      return students;
    }));
  }

  //get all pending students
  getPendingStudents(classId: number) {
    return this.http.get<{ pendingStudents: Student[] }>(
      environment.BACKEND_URL + `/class_students/pending/${classId}`
    ).pipe(map((response) => {
      const students = [];
      response.pendingStudents.forEach(studentData => {
        students.push(new Student(studentData));
      });
      return students;
    }));
  }

  //add pending student (only upon join)
  addPendingStudent(classCode: string) {
    return this.http.post(
      environment.BACKEND_URL + `/class_students/${classCode}`,
      {}
    );
  }

  //approve normal student
  approvePendingStudent(classId: number, studentId: number) {
    return this.http.patch(environment.BACKEND_URL + `/class_students`, {
      classId: classId,
      studentId: studentId,
    });
  }

  //delete pending or normal student
  deleteStudent(classId: number, studentId: number) {
    return this.http.delete(
      environment.BACKEND_URL + `/class_students/${classId}/${studentId}`
    );
  }
}
