import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable, catchError, of } from "rxjs";
import { ClassService } from "./class.service";
import { HttpErrorResponse } from "@angular/common/http";

@Injectable()
export class ClassGuard implements CanActivate {

    constructor(private classService: ClassService, private router: Router) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): 
    boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
        
        //extract the id from the route params
        const classId = route.params["classId"];

        //determine how many times this guard is called
        console.log("CLASS GUARD WAS CALLED MY FRIEND");

        //call set classes
        return this.classService.setClass(classId).pipe(
            catchError((error: HttpErrorResponse) => {
                this.router.navigate(['/classes']);
                return of(false);
            })
        )
    }



}