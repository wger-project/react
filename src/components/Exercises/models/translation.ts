import { Alias, AliasAdapter } from "components/Exercises/models/alias";
import { Note, NoteAdapter } from "components/Exercises/models/note";
import slug from "slug";
import { Adapter } from "utils/Adapter";
import { truncateLongNames } from "utils/strings";


export class Translation {

    notes: Note[] = [];
    aliases: Alias[] = [];
    authors: string[] = [];

    constructor(public id: number | null,
        public uuid: string | null,
        public name: string,
        public description: string,
        public language: number,
        notes?: Note[],
        aliases?: Alias[],
        authors?: string[],
        public descriptionSource?: string
    ) {
        if (notes) {
            this.notes = notes;
        }

        if (aliases) {
            this.aliases = aliases;
        }

        if (authors) {
            this.authors = authors;
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

    get nameSlug(): string {
        return slug(this.name);
    }
}


export class TranslationAdapter implements Adapter<Translation> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fromJson(item: any): Translation {
        return new Translation(
            item.id,
            item.uuid,
            item.name,
            item.description,
            item.language,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            item.notes?.map((e: any) => (new NoteAdapter().fromJson(e))),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            item.aliases?.map((e: any) => (new AliasAdapter().fromJson(e))),
            item.author_history,
            item.description_source
        );
    }

    /**
     * Don't return all properties, since not all items can be updated (they would
     * be ignored by the server, but it's better to not send too much anyway)
     */
    toJson(item: Translation) {

        return {
            id: item.id,
            uuid: item.uuid,
            name: item.name,
            description: item.description,
            language: item.language,
            description_source: item.descriptionSource,
        };
    }
}