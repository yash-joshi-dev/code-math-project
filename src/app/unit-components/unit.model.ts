import { Content } from "../content-components/content.model";

export class Unit {
  public id: number;
  public name: string;
  public isReleased: boolean;
  public contentMapping: number[];
  public isOwner: boolean | undefined;
  public rights: string | undefined;
  public content: Content [] | undefined;

  constructor(unitData: {
        id: number;
        name: string;
        is_released: boolean;
        content_mapping: number[];
        is_owner: boolean;
        rights: string;
        content: any [];
    }) {
    this.id = unitData.id;
    this.name = unitData.name;
    this.isReleased = unitData.is_released;
    this.contentMapping = unitData.content_mapping;
    this.isOwner = unitData.is_owner;
    this.rights = unitData.rights;

    //must convert from snake case to camel case
    if(unitData.content) {
        unitData.content.forEach((contentData) => {
            this.content.push(new Content(contentData));
        })
    }

  }
}
