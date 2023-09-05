export class Content {
  public id: number;
  public name: string;
  public type: string;
  public isOwner: boolean | undefined;
  public rights: string | undefined;
  public status: string | undefined;
  public tags: string[] = [];
  public typeIcon: string;
  public statusIcon: string | undefined;


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
    switch(this.type) {
      case "lesson": this.typeIcon = "library_books";
                     break;
      default: this.typeIcon = "adjust";
    }

    if(this.status) {
      switch(this.status) {
        case "unread": this.statusIcon = "radio_button_unchecked";
                       break;
        case "read": this.statusIcon = "timelapse";
                      break;
        case "attempted": this.statusIcon = "timelapse";
                       break;
        case "completed": this.statusIcon = "done";
                       break;
        default: this.statusIcon = "adjust";
      }
    }

  }
}