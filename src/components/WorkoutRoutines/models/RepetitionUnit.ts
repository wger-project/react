import { Adapter } from "utils/Adapter";

export class RepetitionUnit {
    id: number;
    name: string;

    constructor(id: number, description: string) {
        this.id = id;
        this.name = description;
    }
}


export class RepetitionUnitAdapter implements Adapter<RepetitionUnit> {
    fromJson(item: any): RepetitionUnit {
        return new RepetitionUnit(
            item.id,
            item.name,
        );
    }

    toJson(item: RepetitionUnit) {
        return {};
    }
}