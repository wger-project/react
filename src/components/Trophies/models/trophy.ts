import { Adapter } from "utils/Adapter";

export type trophyType = 'time' | 'volume' | 'count' | 'sequence' | 'date' | 'pr' | 'other';

export interface ApiTrophyType {
    id: number,
    uuid: string,
    name: string,
    description: string,
    image: string,
    "trophy_type": trophyType,
    "is_hidden": boolean,
    "is_progressive": boolean,
}

export type TrophyConstructorParams = {
    id: number;
    uuid: string;
    name: string;
    description: string;
    image: string;
    type: trophyType;
    isHidden: boolean;
    isProgressive: boolean;
};

export class Trophy {

    public id: number;
    public uuid: string;
    public name: string;
    public description: string;
    public image: string;
    public type: string;
    public isHidden: boolean;
    public isProgressive: boolean;


    constructor(params: TrophyConstructorParams) {
        this.id = params.id;
        this.uuid = params.uuid;
        this.name = params.name;
        this.description = params.description;
        this.image = params.image;
        this.type = params.type;
        this.isHidden = params.isHidden;
        this.isProgressive = params.isProgressive;
    }

    static fromJson(json: ApiTrophyType): Trophy {
        return adapter.fromJson(json);
    }
}

class TrophyAdapter implements Adapter<Trophy> {
    fromJson(item: ApiTrophyType) {
        return new Trophy({
            id: item.id,
            uuid: item.uuid,
            name: item.name,
            description: item.description,
            image: item.image,
            type: item.trophy_type,
            isHidden: item.is_hidden,
            isProgressive: item.is_progressive,
        });
    }

    toJson(_: Trophy) {
        return {};
    }
}


const adapter = new TrophyAdapter();