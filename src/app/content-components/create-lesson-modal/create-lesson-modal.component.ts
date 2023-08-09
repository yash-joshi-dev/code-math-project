import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Lesson } from '../lesson.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ContentService } from '../content.service';
import { Content } from '../content.model';

@Component({
  selector: 'app-create-lesson-modal',
  templateUrl: './create-lesson-modal.component.html',
  styleUrls: ['./create-lesson-modal.component.css']
})
export class CreateLessonModalComponent implements OnInit {

  editingMode: boolean;
  action: string = "Create";
  createEditLessonForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<CreateLessonModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { unitId: number, contentId: number},
    private contentService: ContentService
  ) { }

  ngOnInit(): void {

    this.editingMode = (this.data.contentId !== undefined);

    this.createEditLessonForm = new FormGroup({
      "name" : new FormControl("", [Validators.required, Validators.maxLength(150)]),
      "content": new FormControl("", [Validators.required, Validators.maxLength(65500)])
    })

    //if editing mode, get content data and set values
    if(this.editingMode) {
      this.action = "Edit";
      this.contentService.getContent(this.data.contentId).subscribe({
        next: (lessonData) => {
          this.createEditLessonForm.get('name').setValue(lessonData.name);
          this.createEditLessonForm.get('content').setValue(lessonData.content);
        }
      })

    }

  }

  onSubmit() {

    if(this.editingMode) {

      //update content
      this.contentService.updateContent(this.data.contentId, this.createEditLessonForm.value.name, [], {
        content: this.createEditLessonForm.value.content,
        definitionsMapping: []
      }).subscribe({
        next: (response) => {
          this.dialogRef.close({
            ...this.createEditLessonForm.value,
          })
        }
      })

    }
    else if(this.data.unitId) {
      //create a unit lesson
      this.contentService.createUnitContent(this.data.unitId, this.createEditLessonForm.value.name, "lesson", [], {
        content: this.createEditLessonForm.value.content,
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
