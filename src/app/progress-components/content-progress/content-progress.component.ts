import { Component, OnInit } from '@angular/core';
import { ProgressService } from '../progress.service';
import { ActivatedRoute } from '@angular/router';
import { StudentProgressRecord } from '../student-progress-record.model';
import { ContentService } from 'src/app/content-components/content.service';
import { Content } from 'src/app/content-components/content.model';

@Component({
  selector: 'app-content-progress',
  templateUrl: './content-progress.component.html',
  styleUrls: ['./content-progress.component.css', './content-progress.component.less']
})
export class ContentProgressComponent implements OnInit {

  contentId: number;
  contentData: Content;
  studentProgress: StudentProgressRecord [];
  readonly value = [13769, 12367, 10172, 3018, 2592];


  constructor(private progressService: ProgressService, private route: ActivatedRoute, private contentService: ContentService) {}

  ngOnInit(): void {
    
    this.contentId = parseInt(this.route.snapshot.params["contentId"]);

    this.contentService.getBasicContent(this.contentId).subscribe({
      next: (response) => {
        this.contentData = response;
      }
    })

    this.progressService.getContentProgress(this.contentId).subscribe({
      next: (studentProgress) => {
        this.studentProgress = studentProgress;
        console.log(this.studentProgress);
      }
    })



  }

}
