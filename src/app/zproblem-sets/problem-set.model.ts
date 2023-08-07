export class ProblemSet {

    constructor(
        public id: number, 
        public name: string,
        public class_id:  number,
        public released: boolean,
        public problem_mapping: number [],
        public problems: ProblemSummary []
    ) {}

}

export class ProblemSummary {

    constructor(
        public id,
        public name,
        public description,
        public type, 
        public requests
    ) {}

}