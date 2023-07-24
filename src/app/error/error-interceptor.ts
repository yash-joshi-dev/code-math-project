import { HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { catchError, throwError } from "rxjs";
import { ErrorComponent } from "./error.component";

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    
    constructor(private router: Router, private dialog: MatDialog) {}

    intercept(req: HttpRequest<any>, next: HttpHandler) {
        return next.handle(req).pipe(
            catchError((error: HttpErrorResponse) => {
                if(error.error.auth !== undefined && error.error.auth === false) {
                    console.log('doing it')
                    this.router.navigate(["/login"]);
                }
                else {
                    let errorMessage = "Please try again or contact the support developer!"
                    if(error.error.message) {
                        errorMessage = error.error.message;
                    }
                    this.dialog.open(ErrorComponent, {data: {message: errorMessage}})
                }
                return throwError(() => error);
            })
        )
    }
}