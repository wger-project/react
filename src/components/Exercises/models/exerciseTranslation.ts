import { Adapter } from "utils/Adapter";

export class ExerciseTranslation {
    constructor(public id: number,
                public uuid: string,
                public name: string,
                public description: string,
                public language: number,
    ) {
    }
}


export class ExerciseTranslationAdapter implements Adapter<ExerciseTranslation> {
    fromJson(item: any): ExerciseTranslation {
        return new ExerciseTranslation(
            item.id,
            item.uuid,
            item.name,
            item.description,
            item.language,
        );
    }

    /**
     * Don't return all properties, since not all items can be updated (they would
     * be ignored by the server, but it's better to not send too much anyway)
     */
    toJson(item: ExerciseTranslation): any {

        return {
            id: item.id,
            uuid: item.uuid,
            name: item.name,
            description: item.description
        };
    }
}