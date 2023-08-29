import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { ClassService } from 'src/app/class-components/class.service';
import { ContentService } from '../content.service';
import { Unit } from 'src/app/unit-components/unit.model';
import { Content } from '../content.model';
import { AuthService } from 'src/app/authorization/auth.service';
import { ProgressService } from 'src/app/progress-components/progress.service';

@Component({
  selector: 'app-content-container',
  templateUrl: './content-container.component.html',
  styleUrls: ['./content-container.component.css']
})
export class ContentContainerComponent implements OnInit, OnDestroy {

  unitId: number;
  unitData: Unit;
  unitIndex: number;
  contentId: number;
  contentData: Content;
  classId: number;
  contentIndex: number;
  prevContentRoute: any [];
  nextContentRoute: any [];
  statusTimeoutId: number;
  

  constructor(private route: ActivatedRoute, private authService: AuthService, private classService: ClassService, private progressService: ProgressService) { }


  ngOnInit(): void {

    //get the unit and content specified in the route
    this.unitId = parseInt(this.route.snapshot.params["unitId"]);
    this.contentId = parseInt (this.route.snapshot.params["contentId"]);
    this.setPageData();

    //when unitId updates and content updates do everything again
    this.route.params.subscribe({
      next: (params: Params) => {

        this.unitId = parseInt(params["unitId"]);
        this.contentId = parseInt(params["contentId"]);
        this.setPageData();
        
      }
    })

  }

  setPageData() {

    const {units, id} = this.classService.getCurrentClass();
    this.classId = id;

    for(let i = 0; i < units.length; i++) {
      if(units[i].id == this.unitId) {
        this.unitData = units[i];
        this.unitIndex = i;
        break;
      }
    }

    //get the content specified in the route and find the index of the content in the units.content array
    for(let i = 0; i < this.unitData.content.length; i++) {
      if(this.unitData.content[i].id === this.contentId) {
        this.contentIndex = i;
        this.contentData = this.unitData.content[i];
        break;
      }
    }

    if(this.contentIndex == this.unitData.content.length - 1) {
      if(this.unitIndex != units.length - 1 && units[this.unitIndex + 1].content.length > 0) {
        this.nextContentRoute = ["/class", id, "unit", units[this.unitIndex + 1].id, "content", units[this.unitIndex + 1].content[0].id];
      }
      else {
        this.nextContentRoute = ["/class", id];
      }
    }
    else {
      this.nextContentRoute = ["/class", id, "unit", this.unitId, "content", this.unitData.content[this.contentIndex + 1].id];
    }

    if(this.contentIndex == 0) {
      if(this.unitIndex != 0 && units[this.unitIndex - 1].content.length > 0) {
        this.prevContentRoute = ["/class", id, "unit", units[this.unitIndex - 1].id, "content", units[this.unitIndex - 1].content[units[this.unitIndex - 1].content.length - 1].id];
      }
      else {
        this.prevContentRoute = ["/class", id];
      }
    }
    else {
      this.prevContentRoute = ["/class", id, "unit", this.unitId, "content", this.unitData.content[this.contentIndex - 1].id];
    }



    //if person is a student and status for this problem is unread, set timer to set it to read
    if(this.authService.getIsStudent() && this.contentData.status === "unread") {

      this.statusTimeoutId = setTimeout(() => {
        this.progressService.setProgressToRead(this.contentId).subscribe({
          next: (response) => {
            this.contentData.status = "read";
            console.log("the status of the rpoblem is now read");
          }
        });
      }, 10000) as any;

    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.statusTimeoutId);
  }

}
