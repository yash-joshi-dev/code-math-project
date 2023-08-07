export class Definition {
    
    public id: number;
    public word: string; 
    public definition: string;
    public teacherId: number;

    constructor(definitionData) {
        this.id = definitionData.id;
        this.word = definitionData.word;
        this.definition = definitionData.definition;
        this.teacherId = definitionData.teacher_id;
    }

}