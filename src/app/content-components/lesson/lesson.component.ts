import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Lesson } from '../lesson.model';
import { ContentService } from '../content.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-lesson',
  templateUrl: './lesson.component.html',
  styleUrls: ['./lesson.component.css']
})
export class LessonComponent implements OnInit, OnChanges {

  @Input() prevContentRoute: any [];
  @Input() nextContentRoute: any [];
  @Input("contentId") lessonId: number;
  lessonData: Lesson;

  constructor(private contentService: ContentService) {}

  ngOnInit(): void {
    this.setLessonData();
  }

  setLessonData() {
    this.contentService.getContent(this.lessonId).subscribe({
      next: (lessonData) => {
        this.lessonData = new Lesson(lessonData);
      }
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes.lessonId) {
      this.setLessonData();
    }
  }

}
