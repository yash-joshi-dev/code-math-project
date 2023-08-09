import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ContentService } from '../content.service';

@Component({
  selector: 'app-delete-content-modal',
  templateUrl: './delete-content-modal.component.html',
  styleUrls: ['./delete-content-modal.component.css']
})
export class DeleteContentModalComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DeleteContentModalComponent>,
    @Inject (MAT_DIALOG_DATA) public data: {contentId: number},
    private contentService: ContentService
  ) { }

  ngOnInit(): void {
  }

  onDeleteContent() {
    this.contentService.deleteContent(this.data.contentId).subscribe({
      next: (response) => {
        this.dialogRef.close(true);
      }
    })
  }

}
