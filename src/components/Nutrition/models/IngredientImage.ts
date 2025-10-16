import { ApiIngredientImageType } from "types";
import { Adapter } from "utils/Adapter";


export type IngredientImageConstructorParams = {
    id: number;
    uuid: string;
    url: string;
    created: Date;
    lastUpdate: Date;
    size: number;
    width: number;
    height: number;
};

export class IngredientImage {
    public id: number;
    public uuid: string;
    public url: string;
    public created: Date;
    public lastUpdate: Date;
    public size: number;
    public width: number;
    public height: number;

    constructor(params: IngredientImageConstructorParams) {
        this.id = params.id;
        this.uuid = params.uuid;
        this.url = params.url;
        this.created = params.created;
        this.lastUpdate = params.lastUpdate;
        this.size = params.size;
        this.width = params.width;
        this.height = params.height;
    }

    static fromJson(json: ApiIngredientImageType): IngredientImage {
        return adapter.fromJson(json);
    }
}

class IngredientImageAdapter implements Adapter<IngredientImage> {
    fromJson(item: ApiIngredientImageType) {
        return new IngredientImage({
            id: item.id,
            uuid: item.uuid,
            url: item.image,
            created: new Date(item.created),
            lastUpdate: new Date(item.last_update),
            size: item.size,
            width: item.width,
            height: item.height,
        });
    }
}

const adapter = new IngredientImageAdapter();