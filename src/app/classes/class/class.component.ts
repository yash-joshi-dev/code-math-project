import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Class } from '../class.model';
import { ClassesService } from '../classes.service';

@Component({
  selector: 'app-class',
  templateUrl: './class.component.html',
  styleUrls: ['./class.component.css']
})
export class ClassComponent implements OnInit {

  classData: Class;

  constructor(private route: ActivatedRoute, private classesService: ClassesService) {}

  ngOnInit(): void {

    //add subscription to the params
    this.route.params.subscribe(
      params => {
        this.classesService.getClass(params['code']).subscribe(
          response => {
            this.classData = response.classData;
          }
        )
      }
    );

  }

}
