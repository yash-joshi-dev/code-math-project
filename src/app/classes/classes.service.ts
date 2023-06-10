import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthService } from "../authorization/auth.service";
import { Class } from "./class.model";

@Injectable({providedIn: 'root'})
export class ClassesService {

    constructor(private http: HttpClient, private authService: AuthService) {}
    
    createClass(name: string, teacherName: string) {

        const newClassData = {
            name: name,
            teacher_name: teacherName
        }

        return this.http.post<{classData: Class}>("http://localhost:3000/api/classes", newClassData);

    }

    editClass(name: string, teacherName: string, classId: number) {

        const newClassData = {
            name: name,
            teacher_name: teacherName
        }

        return this.http.put<{classData: Class}>("http://localhost:3000/api/classes/" + classId, newClassData);

    }

    //get classes
    getClasses() {
        return this.http.get<{classes: Class[]}>("http://localhost:3000/api/classes");
    }

    //get class
    getClass(classCode: string) {
        return this.http.get<{classData: Class}>("http://localhost:3000/api/classes/" + classCode);
    }

    deleteClass(classId: number) {
        return this.http.delete("http://localhost:3000/api/classes/" + classId);
    }


}