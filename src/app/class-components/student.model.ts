export class Student {

  public id: number;
  public name: string;
  public emailAddress: string;

  constructor(studentData: any) {
    this.id = studentData.id;
    this.name = studentData.name;
    this.emailAddress = studentData.email_address;
  }
}
