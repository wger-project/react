import { Adapter } from "utils/Adapter";

export class Equipment {

    constructor(
        public id: number,
        public name: string
    ) {
    }
}

export class EquipmentAdapter implements Adapter<Equipment> {
    fromJson(item: any): Equipment {
        return new Equipment(
            item.id,
            item.name,
        );
    }

    toJson(item: Equipment): any {
        return {
            id: item.id,
            name: item.name,
        };
    }
}