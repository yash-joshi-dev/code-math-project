import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { map } from "rxjs";
import { ClassService } from "../class-components/class.service";


@Injectable({providedIn: "root"})
export class ProgressService {

    constructor(private http: HttpClient, private classService: ClassService) {}


    //------------------------------------------------------------MAIN ROUTES

    setProgressToRead(contentId: number) {
        return this.http.put(environment.BACKEND_URL + `/student_progress/${this.classService.getCurrentClass().id}/${contentId}`, {});
    }
    //"/:class_id/:content_id"
    // createUnitContent(unitId: number, name: string, type: string, tags: string[], additionalData: any) {
    //     //name, type, tags, content, definitionsMapping
    //     return this.http.post<{message: string, newContentData: any}>(environment.BACKEND_URL + `/content/${unitId}`,{
    //         name: name,
    //         type: type,
    //         tags: tags,
    //         ...additionalData
    //     });
    // }

    // updateContent(contentId: number, name: string, tags: string[], additionalData: any) {
    //     return this.http.put(environment.BACKEND_URL + `/content/${contentId}`, {
    //         name: name,
    //         tags: tags,
    //         ...additionalData
    //     })
    // }

    // deleteContent(contentId: number) {
    //     return this.http.delete(environment.BACKEND_URL + `/content/${contentId}`);
    // }

}