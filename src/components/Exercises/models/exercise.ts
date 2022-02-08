import { Adapter } from "utils/Adapter";

export class Exercise {
    constructor(public id: number,
                public uuid: string,
                public name: string,
                public description: string,
    ) {
    }
}


export class ExerciseAdapter implements Adapter<Exercise> {
    fromJson(item: any): Exercise {
        return new Exercise(
            item.id,
            item.uuid,
            item.name,
            item.description,
        );
    }

    /**
     * Don't return all properties, since not all items can be updated (they would
     * be ignored by the server, but it's better to not send too much anyway)
     */
    toJson(item: Exercise): any {

        return {
            id: item.id,
            uuid: item.uuid,
            name: item.name,
            description: item.description
        };
    }
}