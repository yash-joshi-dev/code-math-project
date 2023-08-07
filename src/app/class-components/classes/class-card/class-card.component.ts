import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Class } from '../../class.model';
import { ClassService } from '../../class.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-class-card',
  templateUrl: './class-card.component.html',
  styleUrls: ['./class-card.component.css'],
})
export class ClassCardComponent implements OnInit {
  @Input('classData') class: Class;
  @Input() isTeacher: boolean;
  @Output() classDeleted = new EventEmitter<Class>();
  @Output() classShared = new EventEmitter<Class>();

  constructor(private router: Router, private classService: ClassService) {}

  ngOnInit(): void {}

  onClassClicked(classData: Class) {
    //navigate to the specic class home page (assignments page or something)
    //remember to store current class state in class service
    // console.log(this.cryptoService.encryptMessage(classData.id.toString()));
    this.router.navigate(['/class', classData.id]);
  }

  onEditClass(classData: Class) {
    this.classService.onEditClass(classData);
  }

  onShareClass(classData: Class) {
    this.classShared.emit(classData);
  }

  onDeleteClass(classData: Class) {
    this.classDeleted.emit(classData);
  }
}
