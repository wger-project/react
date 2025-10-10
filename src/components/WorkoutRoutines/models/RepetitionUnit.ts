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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fromJson(item: any): RepetitionUnit {
        return new RepetitionUnit(
            item.id,
            item.name,
        );
    }
}