import { Alias, AliasAdapter } from "@/components/Exercises/models/alias";
import { Note, NoteAdapter } from "@/components/Exercises/models/note";
import slug from "slug";
import { Adapter } from "@/core/lib/Adapter";
import { truncateLongNames } from "@/core/lib/strings";


export type TranslationConstructorParams = {
    id: number | null;
    uuid: string | null;
    name: string;
    description: string;
    language: number;
    notes?: Note[];
    aliases?: Alias[];
    authors?: string[];
    descriptionSource?: string;
};

export class Translation {

    id: number | null;
    uuid: string | null;

    name: string;

    // The exercise's description, parsed to HTML from the description source
    description: string;

    // The source description of the translation in markdown. This field is usually only used
    descriptionSource: string;

    // The languageID of the translation
    language: number;

    notes: Note[] = [];
    aliases: Alias[] = [];
    authors: string[] = [];

    constructor(init: TranslationConstructorParams) {
        this.id = init.id;
        this.uuid = init.uuid;
        this.name = init.name;
        this.description = init.description;
        this.language = init.language;
        this.descriptionSource = init.descriptionSource ?? '';

        if (init.notes) {
            this.notes = init.notes;
        }

        if (init.aliases) {
            this.aliases = init.aliases;
        }

        if (init.authors) {
            this.authors = init.authors;
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
        return new Translation({
            id: item.id,
            uuid: item.uuid,
            name: item.name,
            description: item.description,
            language: item.language,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            notes: item.notes?.map((e: any) => (new NoteAdapter().fromJson(e))),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            aliases: item.aliases?.map((e: any) => (new AliasAdapter().fromJson(e))),
            authors: item.author_history,
            descriptionSource: item.description_source,
        });
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
            "description_source": item.descriptionSource,
        };
    }
}
