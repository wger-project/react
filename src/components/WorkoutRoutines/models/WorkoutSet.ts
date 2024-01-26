import { Exercise } from "components/Exercises/models/exercise";
import { WorkoutSetting } from "components/WorkoutRoutines/models/WorkoutSetting";
import { settingsToText } from "components/WorkoutRoutines/utils/repText";
import { Adapter } from "utils/Adapter";

export class WorkoutSet {

    settings: WorkoutSetting[] = [];
    settingsComputed: WorkoutSetting[] = [];

    constructor(
        public id: number,
        public sets: number,
        public order: number,
        public comment: string,
        settings?: WorkoutSetting[],
        settingsComputed?: WorkoutSetting[]
    ) {
        if (settings) {
            this.settings = settings;
        }
        if (settingsComputed) {
            this.settingsComputed = settingsComputed;
        }
    }

    // Return all unique exercise bases from settings
    get exercises(): Exercise[] {
        return this.settingsFiltered.map(element => element.base!);
    }

    get settingsFiltered(): WorkoutSetting[] {
        const out: WorkoutSetting[] = [];

        for (const setting of this.settings) {
            const foundSettings = out.filter(s => s.exerciseId === setting.exerciseId);

            if (foundSettings.length === 0) {
                out.push(setting);
            }
        }

        return out;
    }

    filterSettingsByExercise(exerciseId: Exercise): WorkoutSetting[] {
        return this.settings.filter((element) => element.exerciseId === exerciseId.id);
    }

    getSettingsTextRepresentation(exerciseId: Exercise, translate?: (key: string) => string): string {
        translate = translate || (str => str);

        return settingsToText(this.sets, this.filterSettingsByExercise(exerciseId), translate);
    }
}


export class SetAdapter implements Adapter<WorkoutSet> {
    fromJson(item: any) {
        return new WorkoutSet(
            item.id,
            item.sets,
            item.order,
            item.comment
        );
    }

    toJson(item: WorkoutSet) {
        return {
            id: item.id,
            sets: item.sets,
            order: item.order,
            comment: item.order
        };
    }
}