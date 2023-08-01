import { Unit } from "../unit-components/unit.model";

export class Class {
  public id: number;
  public code: string;
  public name: string;
  public isOwner: boolean | undefined;
  public rights: string | undefined;
  public teacherNames: string[];
  public units: Unit[];

  constructor(classData: any) {
    this.id = classData.id;
    this.code = classData.code;
    this.name = classData.name;
    this.isOwner = classData.is_owner;
    this.rights = classData.rights;
    this.teacherNames = classData.teacher_names;
    this.units = [];

    //must convert from snake case to camel case
    classData.units.forEach((unitData) => {
        this.units.push(new Unit(unitData));
    });
  }
}