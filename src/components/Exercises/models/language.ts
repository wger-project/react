import { Adapter } from "utils/Adapter";

export class Language {

    constructor(
        public nameShort: string,
        public nameLong: string
    ) {
    }
}


export class LanguageAdapter implements Adapter<Language> {
    fromJson(item: any): Language {
        return new Language(
            item.short_name,
            item.full_name
        );
    }

    toJson(item: Language): any {
        return {
            short_name: item.nameShort,
            full_name: item.nameLong
        };
    }
}