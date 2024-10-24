import axios from 'axios';
import { SlotConfig, SlotConfigAdapter, SlotConfigType } from "components/WorkoutRoutines/models/SlotConfig";
import { ApiPath } from "utils/consts";
import { makeHeader, makeUrl } from "utils/url";


export interface AddSlotConfigParams {
    slot: number,
    exercise: number,
    type: SlotConfigType,
    order: number,
    comment?: string,
    repetition_unit?: number,
    repetition_rounding?: number,
    weight_unit?: number,
    weight_rounding?: number,
}

export interface EditSlotConfigParams extends Partial<AddSlotConfigParams> {
    id: number,
}

/*
 * Update a Slot config
 */
export const editSlotConfig = async (data: EditSlotConfigParams): Promise<SlotConfig> => {
    const response = await axios.patch(
        makeUrl(ApiPath.SLOT_CONFIG, { id: data.id }),
        data,
        { headers: makeHeader() }
    );

    return new SlotConfigAdapter().fromJson(response.data);
};

/*
 * Delete an existing slot config
 */
export const deleteSlotConfig = async (id: number): Promise<void> => {
    await axios.delete(
        makeUrl(ApiPath.SLOT_CONFIG, { id: id }),
        { headers: makeHeader() }
    );
};

/*
 * Creates a new slot config
 */
export const addSlotConfig = async (data: AddSlotConfigParams): Promise<SlotConfig> => {
    const response = await axios.post(
        makeUrl(ApiPath.SLOT_CONFIG),
        data,
        { headers: makeHeader() }
    );

    return new SlotConfigAdapter().fromJson(response.data);
};


