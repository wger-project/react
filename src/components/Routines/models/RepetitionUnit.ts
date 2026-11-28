import { Adapter } from "@/core/lib/Adapter";

export class RepetitionUnit {
    id: number;
    name: string;
    unitType: 'REPETITIONS' | 'TIME' | 'DISTANCE' | null;
    multiplier: number | null;

    constructor(id: number, description: string, unitType: RepetitionUnit['unitType'] = null, multiplier: number | null = null) {
        this.id = id;
        this.name = description;
        this.unitType = unitType;
        this.multiplier = multiplier;
    }
}


export class RepetitionUnitAdapter implements Adapter<RepetitionUnit> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fromJson(item: any): RepetitionUnit {
        return new RepetitionUnit(
            item.id,
            item.name,
            item.unit_type ?? null,
            item.multiplier ?? null,
        );
    }
}
