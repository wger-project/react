import { Adapter } from "utils/Adapter";

export class Equipment {

    constructor(
        public id: number,
        public name: string
    ) {
    }
}

export class EquipmentAdapter implements Adapter<Equipment> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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