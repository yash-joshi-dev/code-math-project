import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { environment } from "src/environments/environment";
import { CreateLessonModalComponent } from "./create-lesson-modal/create-lesson-modal.component";

@Injectable({providedIn: "root"})
export class ContentService {

    constructor(private dialog: MatDialog, private http: HttpClient) {}

    //-----------------------------------------------------------CONTENT ACTIONS
    onCreateLesson(unitId?: number) {

        const dialogRef = this.dialog.open(CreateLessonModalComponent, {height: '100%', width: '100%', data: {unitId: unitId}})
        return dialogRef.afterClosed();
    }

    //------------------------------------------------------------MAIN ROUTES

    createUnitContent(unitId: number, name: string, type: string, tags: string[], additionalData: any) {
        //name, type, tags, content, definitionsMapping
        return this.http.post<{message: string, newContentData: any}>(environment.BACKEND_URL + `/content/${unitId}`,{
            name: name,
            type: type,
            tags: tags,
            ...additionalData
        });
    }

}