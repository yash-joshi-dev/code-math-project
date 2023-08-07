import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Lesson } from '../lesson.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ContentService } from '../content.service';
import { Content } from '../content.model';

@Component({
  selector: 'app-create-lesson-modal',
  templateUrl: './create-lesson-modal.component.html',
  styleUrls: ['./create-lesson-modal.component.css']
})
export class CreateLessonModalComponent implements OnInit {

  // editingMode: boolean;

  createLessonForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<CreateLessonModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { unitId: number},
    private contentService: ContentService
  ) { }

  ngOnInit(): void {

    // this.editingMode = (this.data.lessonData !== undefined);
    this.createLessonForm = new FormGroup({
      "name" : new FormControl("", [Validators.required, Validators.maxLength(150)]),
      "content": new FormControl("", [Validators.required, Validators.maxLength(65500)])
    })

  }

  onSubmit() {
    if(this.data.unitId) {
      //create a unit lesson
      this.contentService.createUnitContent(this.data.unitId, this.createLessonForm.value.name, "lesson", [], {
        content: this.createLessonForm.value.content,
        definitionsMapping: []
      }).subscribe({
        next: (response) => {
          this.dialogRef.close(new Content(response.newContentData));
        }
      })
    } else {
      //create lesson just for a library
    }
  }


}
