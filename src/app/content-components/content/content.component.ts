import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Content } from '../content.model';
import { ContentService } from '../content.service';
import { AuthService } from 'src/app/authorization/auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css']
})
export class ContentComponent implements OnInit {

  @Input() contentData: Content;
  @Input() studentProgressView: boolean = false;
  @Output() contentDeleted = new EventEmitter<boolean>();
  isTeacher: boolean;

  constructor(private route: ActivatedRoute, private contentService: ContentService, private authService: AuthService) { }

  ngOnInit(): void {
    this.isTeacher = this.authService.getIsTeacher();
  }

  onContentClicked() {
    if(!this.studentProgressView) {
      this.contentService.onOpenContent(this.contentData.id, this.contentData.type, this.route);
    }
    else {
      //go to non-existent student-content progress page (IFF not a lesson)
      console.log("going to student-problem progress page");
    }
  }

  onEditContent() {
    this.contentService.onEditContent(this.contentData.id, this.contentData.type).subscribe({
      next: (updatedContentData) => {
        this.contentData.name = updatedContentData.name;

      }
    });
  }

  onDeleteContent() {
    this.contentService.onDeleteContent(this.contentData.id).subscribe({
      next: (contentWasDeleted) => {
        if(contentWasDeleted) this.contentDeleted.emit(true);
      }
    })
  }

}
