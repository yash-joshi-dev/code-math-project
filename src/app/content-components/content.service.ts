import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { environment } from "src/environments/environment";
import { CreateLessonModalComponent } from "./create-lesson-modal/create-lesson-modal.component";
import { DeleteContentModalComponent } from "./delete-content-modal/delete-content-modal.component";
import { ActivatedRoute, Router } from "@angular/router";
import { map } from "rxjs";
import { Lesson } from "./lesson.model";
import { Content } from "./content.model";

@Injectable({providedIn: "root"})
export class ContentService {

    constructor(private router: Router, private dialog: MatDialog, private http: HttpClient) {}

    //-----------------------------------------------------------CONTENT ACTIONS

    onOpenContent(unitId: number, contentId: number, contentType: string, currentRoute: ActivatedRoute) {

        //if unitId undefined, means outside unit, so just navigate to thing directly
        //otherwise go through unit

        switch(contentType) {
            case "lesson": this.router.navigate(['unit', unitId, 'content', contentId], {relativeTo: currentRoute});
                            break;
            default: console.log("Thes content you are trying to open is not a valid type.");

        }

    }


    onCreateLesson(unitId?: number) {

        const dialogRef = this.dialog.open(CreateLessonModalComponent, {height: '100%', width: '100%', data: {unitId: unitId}})
        return dialogRef.afterClosed();
    }

    onEditContent(contentId: number, contentType: string) {

        let dialogRef;
        switch(contentType) {
            case "lesson": dialogRef = this.dialog.open(CreateLessonModalComponent, {height: '100%', width: '100%', data: {contentId: contentId}});
                            break;
            default: console.log("An error occurred while editing content cause content type wasn't right");
        }
        return dialogRef.afterClosed();

    }

    onDeleteContent(contentId: number) {

        const dialogRef = this.dialog.open(DeleteContentModalComponent, {data: {contentId: contentId}})
        return dialogRef.afterClosed();

    }

    //------------------------------------------------------------MAIN ROUTES

    getContent(contentId: number) {
        return this.http.get<{contentData: any}>(environment.BACKEND_URL + `/content/${contentId}`).pipe(
            map((response) => {
                //can't do anything here other than return data directly
                return response.contentData;
            })
        )
    }

    getAllContent(contentType: string | undefined, classId: number | undefined, unitId: number | undefined) {
        let params = new HttpParams();
        params = params.set('content_type', contentType);
        params = params.set('class_id', classId);
        params = params.set('unit_id', unitId);

        return this.http.get<{content: any[]}>(environment.BACKEND_URL + "/content", {params}).pipe(
            map((response) => {
                let content: Content [] = [];

                response.content.forEach((item) => {content.push(new Content(item));});
                return content;
            })
        )
    }

    getBasicContent(contentId: number) {
        return this.http.get<{contentData: any}>(environment.BACKEND_URL + `/content/basic/${contentId}`).pipe(
            map((response) => {
                return new Content(response.contentData);
            })
        )
    }

    createUnitContent(unitId: number, name: string, type: string, tags: string[], additionalData: any) {
        //name, type, tags, content, definitionsMapping
        return this.http.post<{message: string, newContentData: any}>(environment.BACKEND_URL + `/content/${unitId}`,{
            name: name,
            type: type,
            tags: tags,
            ...additionalData
        });
    }

    updateContent(contentId: number, name: string, tags: string[], additionalData: any) {
        return this.http.put(environment.BACKEND_URL + `/content/${contentId}`, {
            name: name,
            tags: tags,
            ...additionalData
        })
    }

    deleteContent(contentId: number) {
        return this.http.delete(environment.BACKEND_URL + `/content/${contentId}`);
    }

}