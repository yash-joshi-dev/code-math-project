import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Student } from './student.model';

@Injectable({ providedIn: 'root' })
export class ClassStudentsService {
  constructor(private http: HttpClient) {}

  //get all students
  getStudents(classId: number) {
    return this.http.get<{ students: Student[] }>(
      'http://localhost:3000/api/class-students/' + classId
    );
  }

  //get all pending students
  getPendingStudents(classId: number) {
    return this.http.get<{ pendingStudents: Student[] }>(
      'http://localhost:3000/api/class-students/pending/' + classId
    );
  }

  //add pending student
  addPendingStudent(classCode: string) {
    return this.http.post(
      'http://localhost:3000/api/class-students/' + classCode,
      {}
    );
  }

  //approve normal student
  approvePendingStudent(classId: number, studentId: number) {
    return this.http.patch('http://localhost:3000/api/class-students', {
      classId: classId,
      studentId: studentId,
    });
  }

  //delete pending or normal student
  deleteStudent(classId: number, studentId: number) {
    return this.http.delete(
      'http://localhost:3000/api/class-students/' + classId + '/' + studentId
    );
  }
}
