import { Definition } from "../definition-components/definition.model";
import { Content } from "./content.model";

export class Lesson extends Content {

    public content: string;
    public definitionsMapping: number [];
    public definitions: Definition [] = [];
    
    
    constructor(lessonData: any) {
        super(lessonData);
        this.content = lessonData.content;
        this.definitionsMapping = lessonData;

        if(lessonData.definitions) {
            lessonData.definitions.forEach(definitionData => {
                this.definitions.push(new Definition(definitionData))
            });
        }

    }
    

}