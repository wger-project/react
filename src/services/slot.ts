import axios from 'axios';
import { Slot } from "components/WorkoutRoutines/models/Slot";
import { ApiPath } from "utils/consts";
import { makeHeader, makeUrl } from "utils/url";


/*
 * Creates a new Slot
 */
export const addSlot = async (slot: Slot): Promise<Slot> => {
    const response = await axios.post(
        makeUrl(ApiPath.SLOT),
        slot.toJson(),
        { headers: makeHeader() }
    );

    return Slot.fromJson(response.data);
};

/*
 * Update a Slot
 */
export const editSlot = async (slot: Slot): Promise<Slot> => {
    const response = await axios.patch(
        makeUrl(ApiPath.SLOT, { id: slot.id! }),
        slot.toJson(),
        { headers: makeHeader() }
    );

    return Slot.fromJson(response.data);
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


