import { Component, OnInit } from '@angular/core';
import { Lesson } from '../lesson.model';
import { ContentService } from '../content.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-lesson',
  templateUrl: './lesson.component.html',
  styleUrls: ['./lesson.component.css']
})
export class LessonComponent implements OnInit {

  lessonData: Lesson;

  constructor(private route: ActivatedRoute, private contentService: ContentService) { }

  ngOnInit(): void {
    const lessonId = this.route.snapshot.params["lessonId"];

    this.contentService.getContent(lessonId).subscribe({
      next: (lessonData) => {
        this.lessonData = new Lesson(lessonData);
      }
    })
  }

}
