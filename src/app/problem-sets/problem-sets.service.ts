import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ProblemSet } from "./problem-set.model";

@Injectable({providedIn: "root"})
export class ProblemSetsService {

    constructor(private http: HttpClient) {}

    //get all problem sets for particular class
    getProblemSets(classId: number) {

        return this.http.get<{problemSets: ProblemSet []}>("http://localhost:3000/api/problem-sets/" + classId);

    }

    //add a problem set
    createProblemSet(classId: number, name: string, isReleased: boolean) {
       return this.http.post("http://localhost:3000/api/problem-sets/" + classId, {name: name, released: isReleased});

    }

    //update problem set
    updateProblemSet(classId: number, id: number, newName: string, isReleased: boolean, newProblemsMap: number []) {
        return this.http.put("http://localhost:3000/api/problem-sets/" + classId, {id: id, name: newName, released: isReleased, problemMap: newProblemsMap});
 
     }

    //delete problem set
    deleteProblemSet(classId: number, problemSetId: number) {
    
        return this.http.delete("http://localhost:3000/api/problem-sets/" + classId + "/" + problemSetId);

    }

}