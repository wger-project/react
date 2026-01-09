import { ApiTrophyType, Trophy } from "components/Trophies/models/trophy";
import { Adapter } from "utils/Adapter";

export interface ApiUserTrophyType {
    id: number,
    trophy: ApiTrophyType,
    earned_at: string,
    progress: number,
    "is_notified": boolean,
}

export type UserTrophyConstructorParams = {
    id: number;
    trophy: Trophy;
    earnedAt: Date;
    progress: number;
    isNotified: boolean;
};

/*
 * A list of trophies earned by a user, along with their progress.
 */
export class UserTrophy {

    public id: number;
    public trophy: Trophy;
    public earnedAt: Date;
    public progress: number;
    public isNotified: boolean;

    constructor(params: UserTrophyConstructorParams) {
        this.id = params.id;
        this.trophy = params.trophy;
        this.earnedAt = params.earnedAt;
        this.progress = params.progress;
        this.isNotified = params.isNotified;
    }

    static fromJson(json: ApiUserTrophyType): UserTrophy {
        return adapter.fromJson(json);
    }

    toJson() {
        return adapter.toJson(this);
    }
}

class UserTrophyAdapter implements Adapter<UserTrophy> {
    fromJson(item: ApiUserTrophyType) {
        return new UserTrophy({
            id: item.id,
            trophy: Trophy.fromJson(item.trophy),
            earnedAt: new Date(item.earned_at),
            progress: item.progress,
            isNotified: item.is_notified,
        });
    }

    toJson(trophy: UserTrophy) {
        return {
            id: trophy.id,
            "is_notified": trophy.isNotified,
        };
    }
}

const adapter = new UserTrophyAdapter();