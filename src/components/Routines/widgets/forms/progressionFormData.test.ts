import { BaseConfig } from "@/components/Routines/models/BaseConfig";
import { emptyEntry, progressionPayload } from "@/components/Routines/widgets/forms/progressionFormData";
import { ApiPath } from "@/core/lib/consts";

describe('progressionPayload', () => {

    test('deletes a max config only once', () => {
        const configMax = new BaseConfig({ id: 789, slotEntryId: 10, iteration: 2, value: 12 });
        const entry = { ...emptyEntry(2, true, false), idMax: 789, value: '10', valueMax: '' };

        const { maxValues } = progressionPayload([entry], {
            slotEntryId: 10,
            configs: [],
            configsMax: [configMax],
            iterationsToDelete: [2],
            apiPath: ApiPath.REPETITIONS_CONFIG,
            apiPathMax: ApiPath.MAX_REPS_CONFIG,
        });

        expect(maxValues.toDelete).toEqual([789]);
    });
});
