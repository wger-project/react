import { Adapter } from "utils/Adapter";

export class Muscle {
    constructor(
        public id: number,
        public name: string,
        public nameEn: string,
        public isFront: boolean
    ) {
    }

    // Return the name and English name of the muscle, if available.
    public getName(): string {
        if (this.nameEn) {
            return `${this.name} (${this.nameEn})`;
        } else {
            return this.name;
        }
    }

}

export class MuscleAdapter implements Adapter<Muscle> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fromJson(item: any): Muscle {
        return new Muscle(
            item.id,
            item.name,
            item.name_en,
            item.is_front
        );
    }
}