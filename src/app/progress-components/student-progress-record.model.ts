export class StudentProgressRecord {

    public statusIcon: string;
    public contentId: number;
    public studentId: number; 
    public status: string;
    public name: string;

    constructor (record: any) {
        this.contentId = record.content_id;
        this.studentId = record.student_id;
        this.status = record.status;
        this.name = record.name;

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