import { Adapter } from "utils/Adapter";

export class WeightUnit {
    id: number;
    name: string;

    constructor(id: number, description: string) {
        this.id = id;
        this.name = description;
    }
}


export class WeightUnitAdapter implements Adapter<WeightUnit> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fromJson(item: any): WeightUnit {
        return new WeightUnit(
            item.id,
            item.name,
        );
    }
}