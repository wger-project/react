import { Adapter } from "utils/Adapter";
import { Language } from "components/Exercises/models/language";

export class ExerciseTranslation {
    constructor(public id: number,
                public uuid: string,
                public name: string,
                public description: string,
                public language: Language,
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
            new Language('en', 'English'),
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