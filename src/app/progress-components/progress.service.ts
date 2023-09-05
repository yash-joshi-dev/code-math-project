import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { map } from "rxjs";
import { ClassService } from "../class-components/class.service";
import { StudentProgressRecord } from "./student-progress-record.model";
import { Unit } from "../unit-components/unit.model";


@Injectable({providedIn: "root"})
export class ProgressService {

    constructor(private http: HttpClient, private classService: ClassService) {}


    //------------------------------------------------------------MAIN ROUTES

    setProgressToRead(contentId: number) {
        return this.http.put(environment.BACKEND_URL + `/student_progress/${this.classService.getCurrentClass().id}/${contentId}`, {});
    }

    getContentProgress(contentId: number) {
        return this.http.get<{studentProgress: any []}>(environment.BACKEND_URL + `/student_progress/content/${this.classService.getCurrentClass().id}/${contentId}`).pipe(
            map((response) => {
                let studentProgress: StudentProgressRecord [] = [];

                response.studentProgress.forEach((record) => {
                    studentProgress.push(new StudentProgressRecord(record));
                })
                return studentProgress;
            })
        )
    }

    getStudentProgress(studentId: number) {
        return this.http.get<{studentProgressUnits: any []}>(environment.BACKEND_URL + `/student_progress/student/${this.classService.getCurrentClass().id}/${studentId}`).pipe(
            map((response) => {
                let studentProgressUnits: Unit [] = [];
                response.studentProgressUnits.forEach((unitData) => {
                    studentProgressUnits.push(new Unit(unitData));
                })
                return studentProgressUnits;
            })
        )
    }

    getClassProgress() {
        return this.http.get<{studentProgress: any [][][]}>(environment.BACKEND_URL + `/student_progress/class/${this.classService.getCurrentClass().id}`)
        .pipe(map((response) => {
            let studentProgress: StudentProgressRecord [][][] = [];
            // console.log(response);
            response.studentProgress.forEach((unitRecord) => {
                let tempUnitRecords: StudentProgressRecord [][] = [];
                unitRecord.forEach((contentRecords) => {
                    let tempContentRecords: StudentProgressRecord [] = [];
                    contentRecords.forEach((record) => {
                        tempContentRecords.push(new StudentProgressRecord(record));
                    })

                    tempUnitRecords.push(tempContentRecords);
                })
                // console.log("something after");

                studentProgress.push(tempUnitRecords);
                // console.log("everything is still fine");
            })
            // console.log("something in this world");
            return studentProgress;
        }))
    }

}