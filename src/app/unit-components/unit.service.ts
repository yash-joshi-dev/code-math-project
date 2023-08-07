import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map } from "rxjs";
import { environment } from "src/environments/environment";
import { Unit } from "./unit.model";
import { MatDialog } from "@angular/material/dialog";
import { EditUnitModalComponent } from "./edit-unit-modal/edit-unit-modal.component";
import { DeleteUnitModalComponent } from "./delete-unit-modal/delete-unit-modal.component";
import { CreateUnitModalComponent } from "./create-unit-modal/create-unit-modal.component";


@Injectable({ providedIn: 'root' })
export class UnitService {
  constructor(private dialog: MatDialog, private http: HttpClient) {}

  //----------------------------------------------------------UNIT ACTIONS
  
  //TODO
  // onShareClass(classData: Class) {
  //   const dialogRef = this.dialog.open(ShareClassModalComponent, {
  //     data: { classData: classData },
  //   });
  //   return dialogRef.afterClosed();
  // }
  onCreateUnit(classId?: number) {
    const dialogRef = this.dialog.open(CreateUnitModalComponent, {data: {classId: classId}});
    return dialogRef.afterClosed();
  }

  onEditUnit(unitData: Unit) {
    const dialogRef = this.dialog.open(EditUnitModalComponent, {data: {unitData: unitData}});
    return dialogRef.afterClosed();
  }

  onDeleteUnit(unitId: number) {
    const dialogRef = this.dialog.open(DeleteUnitModalComponent, {data: {unitId: unitId}});
    return dialogRef.afterClosed();
  }

  //-------------------------------------------------------------MAIN UNIT ROUTES

  //get all units for a teacher (do later)

  //create unit (do later)
  //create unit in class (important)
  createClassUnit(classId: number, name: string, isReleased: boolean) {
    return this.http.post<{message: string, newUnitData: any}>(environment.BACKEND_URL + `/units/${classId}`, {
      name: name,
      isReleased: isReleased,
    });
  }

  //get units for a class (important)
  getClassUnits(classId: number) {
    return this.http
      .get<{ units: any[] }>(environment.BACKEND_URL + `/units/${classId}`)
      .pipe(
        map((response) => {
          const units: Unit[] = [];
          response.units.forEach((unitData) => {
            units.push(new Unit(unitData));
          });
          return units;
        })
      );
  }

  //edit unit
  updateUnit(unitId: number, name: string, isReleased: boolean, contentMapping: number []) {
    return this.http.put(environment.BACKEND_URL + `/units/${unitId}`, {
      name: name,
      isReleased: isReleased,
      contentMapping: contentMapping
    });
  }

  //delete unit
  deleteUnit(unitId: number) {
    return this.http.delete(environment.BACKEND_URL + `/units/${unitId}`);
  }

}