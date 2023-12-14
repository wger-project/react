import { ApiIngredientImageType } from "types";
import { Adapter } from "utils/Adapter";

export class IngredientImage {

    constructor(
        public id: number,
        public uuid: string,
        public url: string,
        public created: Date,
        public lastUpdate: Date,
        public size: number,
        public width: number,
        public height: number,
    ) {
    }
}


export class IngredientImageAdapter implements Adapter<IngredientImage> {
    fromJson(item: ApiIngredientImageType) {
        return new IngredientImage(
            item.id,
            item.uuid,
            item.image,
            new Date(item.created),
            new Date(item.last_update),
            item.size,
            item.width,
            item.height,
        );
    }
}