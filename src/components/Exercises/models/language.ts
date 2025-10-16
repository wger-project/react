import { Adapter } from "utils/Adapter";

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