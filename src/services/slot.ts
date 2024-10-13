import axios from 'axios';
import { Slot, SlotAdapter } from "components/WorkoutRoutines/models/Slot";
import { ApiPath } from "utils/consts";
import { makeHeader, makeUrl } from "utils/url";


export interface AddSlotParams {
    order: number;
    comment: string;
    description: string;
    next_day?: number;
    is_rest: boolean;
}

export interface EditSlotParams extends Partial<AddSlotParams> {
    id: number,
}

/*
 * Update a Slot
 */
export const editSlot = async (data: EditSlotParams): Promise<Slot> => {
    const response = await axios.patch(
        makeUrl(ApiPath.SLOT, { id: data.id }),
        data,
        { headers: makeHeader() }
    );

    return new SlotAdapter().fromJson(response.data);
};

/*
 * Delete an existing lot
 */
export const deleteSlot = async (id: number): Promise<void> => {
    await axios.delete(
        makeUrl(ApiPath.SLOT, { id: id }),
        { headers: makeHeader() }
    );
};


