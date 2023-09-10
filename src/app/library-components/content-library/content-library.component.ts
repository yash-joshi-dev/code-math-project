import { Component, OnInit } from '@angular/core';
import { ClassService } from 'src/app/class-components/class.service';
import { Content } from 'src/app/content-components/content.model';
import { ContentService } from 'src/app/content-components/content.service';
import { UnitService } from 'src/app/unit-components/unit.service';

@Component({
  selector: 'app-content-library',
  templateUrl: './content-library.component.html',
  styleUrls: ['./content-library.component.css']
})
export class ContentLibraryComponent implements OnInit {

  types: string[] = ["lesson", "block", "ordering", "tracing", "pseudocode"];
  classes: {name: string, id: number} [];
  units: {name: string, id: number} [];
  currentClassId: number;
  currentUnitId: number;
  currentType: string;
  content: Content [];

  
  constructor(private unitService: UnitService, private classService: ClassService, private contentService: ContentService) { }

  ngOnInit(): void {
    this.classService.getClassesBasicInfo().subscribe({
      next: (response) => {
        this.classes = response.classesBasicInfo;
      }
    })
    this.unitService.getUnitsBasicInfo().subscribe({
      next: (response) => {
        this.units = response.unitsBasicInfo;
      }
    })
    this.getContent();
  }

  onTypeSelectionChange() {
    this.getContent();
  }

  onClassSelectionChange() {
    this.getContent();
  }

  onUnitSelectionChange() {
    this.getContent();
  }

  getContent() {
    this.contentService.getAllContent(this.currentType, this.currentClassId, this.currentUnitId).subscribe({
      next: (response) => {
        this.content = response;
        console.log(this.content);
      }
    })
  }
  
  onContentDeleted(index: number) {
    this.content.splice(index, 1);
  }

}
