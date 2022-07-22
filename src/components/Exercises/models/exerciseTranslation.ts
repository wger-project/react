import { Adapter } from "utils/Adapter";
import { truncateLongNames } from "utils/strings";
import { Note, NoteAdapter } from "components/Exercises/models/note";
import { Alias, AliasAdapter } from "components/Exercises/models/alias";


export class ExerciseTranslation {

    notes: Note[] = [];
    aliases: Alias[] = [];

    constructor(public id: number,
                public uuid: string,
                public name: string,
                public description: string,
                public language: number,
                notes?: Note[],
                aliases?: Alias[]
    ) {
        if (notes) {
            this.notes = notes;
        }

        if (aliases) {
            this.aliases = aliases;
        }
    }

    /**
     * Returns the first characters of an exercise name
     *
     * This is used in places where we need to display the exercise name in a
     * list or similar
     */
    get nameLong(): string {
        return truncateLongNames(this.name);
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
            item.notes.map((e: any) => (new NoteAdapter().fromJson(e))),
            item.aliases.map((e: any) => (new AliasAdapter().fromJson(e))),
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
            description: item.description,
            language: item.language,
        };
    }
}