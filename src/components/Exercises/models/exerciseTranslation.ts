import { Adapter } from "utils/Adapter";

const MAX_LENGTH = 20;

export class ExerciseTranslation {
    constructor(public id: number,
                public uuid: string,
                public name: string,
                public description: string,
                public language: number,
    ) {
    }

    /**
     * Returns the first characters of an exercise name
     *
     * This is used in places where we need to display the exercise name in a
     * list or similar
     */
    get nameLong(): string {
        return this.name.length > MAX_LENGTH ? this.name.slice(0, MAX_LENGTH) + '…' : this.name;
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