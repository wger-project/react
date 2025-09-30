import axios from "axios";
import { Slot } from "components/WorkoutRoutines/models/Slot";
import { addSlot, deleteSlot, editSlot } from "services/slot";
import { ApiPath } from "utils/consts";
import { makeHeader, makeUrl } from "utils/url";

jest.mock('axios');

describe("Slot service tests", () => {
    const slotData = {
        day: 1,
        order: 1,
        comment: 'test',
        config: null
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Creates a new Slot', async () => {
        (axios.post as jest.Mock).mockImplementation(() => Promise.resolve({ data: { id: 123, ...slotData } }));
        const slot = Slot.fromJson(slotData);

        const result = await addSlot(slot);

        expect(axios.post).toHaveBeenCalledWith(
            makeUrl(ApiPath.SLOT),
            slot.toJson(),
            { headers: makeHeader() }
        );
        expect(result).toStrictEqual(new Slot({ id: 123, dayId: 1, order: 1, comment: 'test', config: null }));
    });

    test('Update a Slot', async () => {
        (axios.patch as jest.Mock).mockImplementation(() => Promise.resolve({
            data: {
                id: 123,
                ...slotData,
                comment: 'foo'
            }
        }));

        const slot = Slot.fromJson(slotData);
        slot.comment = 'foo';
        slot.id = 123;
        const result = await editSlot(slot);

        expect(axios.patch).toHaveBeenCalledWith(
            makeUrl(ApiPath.SLOT, { id: 123 }),
            slot.toJson(),
            { headers: makeHeader() }
        );
        expect(result).toStrictEqual(new Slot({ id: 123, dayId: 1, order: 1, comment: 'foo', config: null }));
    });


    test('Delete a Slot', async () => {
        (axios.delete as jest.Mock).mockImplementation(() => Promise.resolve({}));

        await deleteSlot(1);

        expect(axios.delete).toHaveBeenCalledWith(
            makeUrl(ApiPath.SLOT, { id: 1 }),
            { headers: makeHeader() }
        );
    });
});