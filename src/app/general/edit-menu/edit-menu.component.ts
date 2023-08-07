import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-edit-menu',
  templateUrl: './edit-menu.component.html',
  styleUrls: ['./edit-menu.component.css']
})
export class EditMenuComponent implements OnInit {

  @Output() editClick = new EventEmitter<boolean>();
  @Output() deleteClick = new EventEmitter<boolean>();


  constructor() { }

  ngOnInit(): void {
  }

  onEditClicked() {
    this.editClick.emit(true);
  }

  onDeleteClicked() {
    this.deleteClick.emit(true);
  }

}
