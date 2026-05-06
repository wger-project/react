import { Adapter } from "@/utils/Adapter";

export class Language {

    constructor(
        public id: number,
        public nameShort: string,
        public nameLong: string
    ) {
    }
}


export class LanguageAdapter implements Adapter<Language> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fromJson(item: any): Language {
        return new Language(
            item.id,
            item.short_name,
            item.full_name
        );
    }
}


/*
 * Searches the given list for the language with the matching short name.
 *
 * Pure synchronous lookup, accepts an already-loaded `availableLanguages`
 * list. Pair with `useLanguageQuery()` to obtain it.
 */
export const getLanguageByShortName = (name: string, availableLanguages: Language[]): Language | undefined => {

    // If the name is in the form of "en-US", remove the country code
    const shortName = name.split('-')[0];

    return availableLanguages.find(l => l.nameShort === shortName);
};