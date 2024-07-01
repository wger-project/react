import { ApiAliasType } from "types";
import { Adapter } from "utils/Adapter";

export class Alias {
    constructor(
        public id: number,
        public uuid: string,
        public alias: string,
    ) {
    }

}

export class AliasAdapter implements Adapter<Alias> {
    fromJson(item: ApiAliasType): Alias {
        return new Alias(
            item.id,
            item.uuid,
            item.alias,
        );
    }

    toJson(item: Alias) {
        return {
            id: item.id,
            name: item.alias,
        };
    }
}