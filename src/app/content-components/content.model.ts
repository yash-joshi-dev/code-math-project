export class Content {
  public id: number;
  public name: string;
  public type: string;
  public isOwner: boolean | undefined;
  public rights: string | undefined;
  public status: string | undefined;
  public tags: string[] = [];


  constructor(contentData: {
    id: number;
    name: string;
    type: string;
    is_owner: boolean;
    rights: string;
    status: string;
    tags: string[];
  }) {
    this.id = contentData.id;
    this.name = contentData.name;
    this.type = contentData.type;
    this.isOwner = contentData.is_owner;
    this.rights = contentData.rights;
    this.status =  contentData.status;
    if(contentData.tags) {
      this.tags = contentData.tags;
    }
  }
}