import axios from 'axios';
import { SlotEntry, SlotEntryType } from "components/WorkoutRoutines/models/SlotEntry";
import { ApiPath } from "utils/consts";
import { makeHeader, makeUrl } from "utils/url";


export interface AddSlotEntryParams {
    slot: number,
    exercise: number,
    type: SlotEntryType,
    order: number,
    comment?: string,
    repetition_unit?: number,
    repetition_rounding?: number | null,
    weight_unit?: number,
    weight_rounding?: number | null,
}

export interface EditSlotEntryParams extends Partial<AddSlotEntryParams> {
    id: number,
}

/*
 * Update a Slot entry
 */
export const editSlotEntry = async (slotEntry: SlotEntry): Promise<SlotEntry> => {
    const response = await axios.patch(
        makeUrl(ApiPath.SLOT_ENTRY, { id: slotEntry.id }),
        slotEntry.toJson(),
        { headers: makeHeader() }
    );

    return SlotEntry.fromJson(response.data);
};

/*
 * Delete an existing slot entry
 */
export const deleteSlotEntry = async (id: number): Promise<void> => {
    await axios.delete(
        makeUrl(ApiPath.SLOT_ENTRY, { id: id }),
        { headers: makeHeader() }
    );
};

/*
 * Creates a new slot entry
 */
export const addSlotEntry = async (data: AddSlotEntryParams): Promise<SlotEntry> => {
    const response = await axios.post(
        makeUrl(ApiPath.SLOT_ENTRY),
        data,
        { headers: makeHeader() }
    );

    return SlotEntry.fromJson(response.data);
};


