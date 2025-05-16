import i18n from "i18n";
import { Adapter } from "utils/Adapter";
import { getTranslationKey } from "utils/strings";


export class Category {

    constructor(
        public id: number,
        public name: string
    ) {
    }

    public get translatedName(): string {
        return i18n.t(getTranslationKey(this.name), { defaultValue: this.name });
    }
}


export class CategoryAdapter implements Adapter<Category> {
    fromJson(item: any): Category {
        return new Category(
            item.id,
            item.name
        );
    }

    toJson(item: Category) {
        return {
            id: item.id,
            name: item.name,
        };
    }
}