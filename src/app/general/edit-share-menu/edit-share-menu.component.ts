import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-edit-share-menu',
  templateUrl: './edit-share-menu.component.html',
  styleUrls: ['./edit-share-menu.component.css']
})
export class EditShareMenuComponent implements OnInit {
  @Output() editClick = new EventEmitter<boolean>();
  @Output() shareClick = new EventEmitter<boolean>();
  @Output() deleteClick = new EventEmitter<boolean>();


  constructor() { }

  ngOnInit(): void {
  }

  onEditClicked() {
    this.editClick.emit(true);
  }

  onShareClicked() {
    this.shareClick.emit(true);
  }

  onDeleteClicked() {
    this.deleteClick.emit(true);
  }

}
