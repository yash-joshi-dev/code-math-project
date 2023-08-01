export class Teacher {
  public name: string;
  public id: number;
  public rights: string;
  public isOwner: boolean;
  public emailAddress: string;

  constructor(teacherData: any) {
    this.name = teacherData.name;
    this.id = teacherData.id;
    this.rights = teacherData.rights;
    this.isOwner = teacherData.is_owner;
    this.emailAddress = teacherData.email_address;
  }
}
