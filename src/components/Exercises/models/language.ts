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
    fromJson(item: any): Language {
        return new Language(
            item.id,
            item.short_name,
            item.full_name
        );
    }

    toJson(item: Language) {
        return {};
    }
}