import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ClassService } from '../../class.service';

@Component({
  selector: 'app-delete-class-modal',
  templateUrl: './delete-class-modal.component.html',
  styleUrls: ['./delete-class-modal.component.css']
})
export class DeleteClassModalComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DeleteClassModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {classId: number}, 
    private classService: ClassService
  ) { }

  ngOnInit(): void {
  }

  onDeleteClass() {
    this.classService.deleteClass(this.data.classId).subscribe({
      next: (response) => {
        this.dialogRef.close(true);
      }
    })
  }

}
