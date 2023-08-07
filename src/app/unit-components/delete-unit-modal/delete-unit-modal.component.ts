import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UnitService } from '../unit.service';

@Component({
  selector: 'app-delete-unit-modal',
  templateUrl: './delete-unit-modal.component.html',
  styleUrls: ['./delete-unit-modal.component.css']
})
export class DeleteUnitModalComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DeleteUnitModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {unitId: number}, 
    private unitService: UnitService
  ) { }

  ngOnInit(): void {
  }

  onDeleteUnit() {
    this.unitService.deleteUnit(this.data.unitId).subscribe({
      next: (response) => {
        this.dialogRef.close(true);
      }
    })
  }

}
