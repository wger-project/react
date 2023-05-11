import { WorkoutSetting } from "components/WorkoutRoutines/models/WorkoutSetting";


function roundToTwoDecimalPlaces(num: number): number {
    if (Number.isInteger(num)) {
        return num; // Return the number as-is if it has no decimal places
    } else {
        return Math.round((num + Number.EPSILON) * 100) / 100; // Round to two decimal places
    }
}

export function repTextWithUnit(sets: number, settingsList: WorkoutSetting[]): string {
    const REP_UNIT_TILL_FAILURE = 2;
    const REP_UNITS_REP_FAILURE = [1, 2];

    const getRirRepresentation = (setting: WorkoutSetting): string => setting.rir ? `${setting.rir} RiR` : "";

    const getRepsRepresentation = (setting: WorkoutSetting, repUnit: string): string => {
        return setting.repetitionUnit === REP_UNIT_TILL_FAILURE ? "∞" : `${setting.reps} ${repUnit}`;
    };

    // TODO: actually translate the names
    const _ = (str: string): string => {
        return str;
    };


    const getRepUnitRepresentation = (setting: WorkoutSetting): string => {
        return !REP_UNITS_REP_FAILURE.includes(setting.repetitionUnit) ? _(setting.repetitionUnitObj!.name) : '';
    };
    const normalizeWeight = (weight: number | null): string => {
        if (weight === null) {
            return '';
        } else if (Number.isInteger(weight)) {
            return weight.toString();
        } else {
            return weight.toFixed(2).toString();
        }
    };

    const getSettingText = (currentSetting: WorkoutSetting, multi: boolean = false): string => {
        const repUnit = getRepUnitRepresentation(currentSetting);
        const reps = getRepsRepresentation(currentSetting, repUnit);
        const weightUnit = currentSetting.weightUnitObj!.name;
        const weight = normalizeWeight(currentSetting.weight);
        const rir = getRirRepresentation(currentSetting);
        let out = multi ? reps : `${sets} × ${reps}`.trim();

        if (weight) {
            const rirText = rir ? `, ${rir}` : "";
            out += ` (${weight} ${weightUnit}${rirText})`;
        } else {
            out += rir ? ` (${rir})` : "";
        }

        return out;
    };

    let settingText = "";


    if (settingsList.length === 1) {
        settingText = getSettingText(settingsList[0]);
    } else if (settingsList.length > 1) {
        settingText = settingsList.map((setting) => getSettingText(setting, true)).join(" – ");
    }

    return settingText;

}