import { ApiTrophyType, Trophy } from "components/Trophies/models/trophy";
import { Adapter } from "utils/Adapter";

export interface ApiUserTrophyType {
    trophy: ApiTrophyType,
    is_earned: boolean
    earned_at: string | null,
    progress: number,
    current_value: number | null,
    target_value: number | null,
    progress_display: string | null,
}

export type UserTrophyConstructorParams = {
    trophy: Trophy;
    isEarned: boolean;
    earnedAt: Date | null;
    progress: number;
    currentValue: number | null;
    targetValue: number | null;
    progressDisplay: string | null;
};

export class UserTrophyProgression {

    public trophy: Trophy;
    public earnedAt: Date | null;
    public isEarned: boolean;
    public progress: number;
    public currentValue: number | null;
    public targetValue: number | null;
    public progressDisplay: string | null;

    constructor(params: UserTrophyConstructorParams) {
        this.trophy = params.trophy;
        this.earnedAt = params.earnedAt;
        this.isEarned = params.isEarned;
        this.progress = params.progress;
        this.currentValue = params.currentValue;
        this.targetValue = params.targetValue;
        this.progressDisplay = params.progressDisplay;
    }

    static fromJson(json: ApiUserTrophyType): UserTrophyProgression {
        return adapter.fromJson(json);
    }
}

class UserTrophyAdapter implements Adapter<UserTrophyProgression> {
    fromJson(item: ApiUserTrophyType) {
        return new UserTrophyProgression({
            trophy: Trophy.fromJson(item.trophy),
            earnedAt: item.earned_at !== null ? new Date(item.earned_at) : null,
            isEarned: item.is_earned,
            progress: item.progress,
            currentValue: item.current_value,
            targetValue: item.target_value,
            progressDisplay: item.progress_display,
        });
    }

    toJson(item: UserTrophyProgression) {
        return {};
    }
}


const adapter = new UserTrophyAdapter();