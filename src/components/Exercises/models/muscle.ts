import { Adapter } from "utils/Adapter";
import { getTranslationKey } from "utils/strings";

export class Muscle {
    constructor(
        public id: number,
        public name: string,
        public nameEn: string,
        public isFront: boolean
    ) {
    }

    // Return the name and english name of the muscle, if available.
    public getName(t: Function): string {
        if (this.nameEn) {
            return `${this.name} (${t(getTranslationKey(this.nameEn))})`;
        } else {
            return this.name;
        }
    }

}

export class MuscleAdapter implements Adapter<Muscle> {
    fromJson(item: any): Muscle {
        return new Muscle(
            item.id,
            item.name,
            item.name_en,
            item.is_front
        );
    }

    toJson(item: Muscle) {
        return {};
    }
}