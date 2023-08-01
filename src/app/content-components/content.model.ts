export class Content {
  public id: number;
  public name: string;
  public type: string;
  public isOwner: boolean | undefined;
  public rights: string | undefined;

  constructor(contentData: {
    id: number;
    name: string;
    type: string;
    is_owner: boolean;
    rights: string;
  }) {
    this.id = contentData.id;
    this.name = contentData.name;
    this.type = contentData.type;
    this.isOwner = contentData.is_owner;
    this.rights = contentData.rights;
  }
}