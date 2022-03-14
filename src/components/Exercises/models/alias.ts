import { Adapter } from "utils/Adapter";

export class Alias {
    constructor(
        public id: number,
        public alias: string,
    ) {
    }

}

export class AliasAdapter implements Adapter<Alias> {
    fromJson(item: any): Alias {
        return new Alias(
            item.id,
            item.alias,
        );
    }

    toJson(item: Alias): any {
        return {
            id: item.id,
            name: item.alias,
        };
    }
}