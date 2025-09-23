import i18n from "i18n";
import { Adapter } from "utils/Adapter";
import { getTranslationKey } from "utils/strings";

export class Equipment {

    constructor(
        public id: number,
        public name: string
    ) {
    }

    public get translatedName(): string {
        return i18n.t(getTranslationKey(this.name), { defaultValue: this.name });
    }
}

export class EquipmentAdapter implements Adapter<Equipment> {
    fromJson(item: any): Equipment {
        return new Equipment(
            item.id,
            item.name,
        );
    }

    toJson(item: Equipment) {
        return {
            id: item.id,
            name: item.name,
        };
    }
}