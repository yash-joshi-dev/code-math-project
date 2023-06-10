import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Subject } from "rxjs";
import { UserData } from "./user-data.model";

@Injectable({providedIn: "root"})
export class AuthService {

    private token: string;
    private authStatusListener = new Subject<boolean>();
    private isAuthenticated = false;
    private tokenTimer: any;
    public userData: UserData;
    private isTeacher = false;

    constructor(private http: HttpClient, private router: Router) {};

    //saves data in local storage
    private saveAuthData(token: string, expirationDate: Date) {
        localStorage.setItem('token', token);
        localStorage.setItem('expiration', expirationDate.toISOString());
        localStorage.setItem('userData', JSON.stringify(this.userData));
    }

    //gets auth data from local storage
    private getAuthData() {

        //get the data
        const token = localStorage.getItem('token');
        const expirationDate = localStorage.getItem('expiration');
        const userData = JSON.parse(localStorage.getItem('userData'));

        //check if both exist; if not, return nothing
        if(!token || !expirationDate) {
            return;
        }

        //if both exist, return both in an object
        return {
            token: token,
            expirationDate: new Date(expirationDate),
            userData: userData
        };

    }

    //clears data from local storage
    private clearAuthData() {
        localStorage.removeItem('token');
        localStorage.removeItem('expiration');
        localStorage.removeItem('userData');
    }

    //sets token stuff, navigates away, and starts logout timer
    private setToken(response: {token: string, expiresIn: number, userData: any}) {
        this.token = response.token;

        if(this.token) {
            
            //get the user data
            this.userData = new UserData(
                response.userData.id,
                response.userData.name,
                response.userData.email_address,
                response.userData.bio,
                response.userData.role,
                response.userData.user_name
            )

            //set timeout to expire the timer
            const expireTime = response.expiresIn;
            this.tokenTimer = setTimeout(this.logout, expireTime * 1000);

            //set all stuff to true
            this.authStatusListener.next(true);
            this.isAuthenticated = true;
            this.isTeacher = this.userData.role === 'teacher';

            //save stuff in local storage
            const currDate = new Date();
            const expirationDate = new Date(currDate.getTime() + expireTime * 1000);
            this.saveAuthData(this.token, expirationDate);

            //navigate to dashboard
            this.router.navigate(['/classes']);

        }

    }

    getToken() {
        return this.token;
    }

    getIsAuthenticated() {
        return this.isAuthenticated;
    }

    getIsTeacher() {
        return this.isTeacher;
    }

    getAuthStatusListener() {
        //prevents other components from emitting values with this
        return this.authStatusListener.asObservable(); 
    }

    createNewUser(newUserData, userType) {

        newUserData.role = userType;

        this.http.post<{token: string, expiresIn: number, newUserData: any}>("http://localhost:3000/api/user/signup", newUserData).subscribe(
        {
            next: (response) => {
                this.loginUser(newUserData);
            },
            error: (error) => {
                this.authStatusListener.next(false);
            }
        });

    }

    loginUser(existingUserData) {

        const userData = existingUserData;
        this.http.post<{token: string, expiresIn: number, userData: any}>("http://localhost:3000/api/user/login", userData).subscribe(
        {
            next: (response) => {
                this.setToken(response);
            },
            error: (error) => {
                this.authStatusListener.next(false);
            }
        });
    }

    autoAuthUser() {

        //get the data
        const userInfo = this.getAuthData();

        //if we get nothing, just return
        if(!userInfo) {
            return;
        }

        //get time diff between now and expiration date
        const currDate = new Date();
        const expireTime = userInfo.expirationDate.getTime() - currDate.getTime();

        if(expireTime > 0) {

            //set stuff to true
            this.token = userInfo.token;
            this.userData = userInfo.userData;
            this.authStatusListener.next(true);
            this.isAuthenticated = true;
            this.isTeacher = this.userData.role === 'teacher';

            //set timer
            this.tokenTimer = setTimeout(this.logout, expireTime);

            //navigate to dashboard (NOTTTTTT)
            // this.router.navigate(['/classes']);

        }
        else {

            // set everything to false:
            this.logout();
        }
    }

    logout() {

        //tell everyone token expired
        this.token = null;
        this.userData = null;
        this.isAuthenticated = false;
        this.isTeacher = false;
        this.authStatusListener.next(false);

        //clear local storage
        this.clearAuthData();

        //navigate away
        this.router.navigate(['/login']);

        //clear timeout
        clearTimeout(this.tokenTimer);

    }
}