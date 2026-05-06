import axios from "axios";
import { SlotEntry } from "@/components/WorkoutRoutines/models/SlotEntry";
import { addSlotEntry, deleteSlotEntry, editSlotEntry } from "@/services/slot_entry";
import { responseSlotEntry } from "@/tests/workoutRoutinesTestData";
import type { Mock } from "vitest";

vi.mock("axios");

describe("SlotEntry service tests", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("addSlotEntry POSTs the serialized entry and returns the parsed SlotEntry", async () => {
        (axios.post as Mock).mockResolvedValue({ data: responseSlotEntry });
        const entry = new SlotEntry({ slotId: 1, exerciseId: 345, comment: "test" });

        const result = await addSlotEntry(entry);

        expect(axios.post).toHaveBeenCalledTimes(1);
        const [url, body] = (axios.post as Mock).mock.calls[0];
        expect(url).toMatch(/\/api\/v2\/slot-entry\/$/);
        // toJson serializes to snake_case fields
        expect(body).toMatchObject({
            slot: 1,
            exercise: 345,
            comment: "test",
            type: "normal",
        });
        expect(result).toBeInstanceOf(SlotEntry);
        expect(result.id).toBe(99);
    });

    test("editSlotEntry PATCHes /slot-entry/<id>/", async () => {
        (axios.patch as Mock).mockResolvedValue({
            data: { ...responseSlotEntry, comment: "updated" },
        });
        const entry = new SlotEntry({ id: 99, slotId: 1, exerciseId: 345, comment: "updated" });

        const result = await editSlotEntry(entry);

        expect(axios.patch).toHaveBeenCalledTimes(1);
        const [url, body] = (axios.patch as Mock).mock.calls[0];
        expect(url).toMatch(/\/api\/v2\/slot-entry\/99\/$/);
        expect(body).toMatchObject({ slot: 1, exercise: 345, comment: "updated" });
        expect(result.comment).toBe("updated");
    });

    test("deleteSlotEntry DELETEs /slot-entry/<id>/", async () => {
        (axios.delete as Mock).mockResolvedValue({ status: 204 });

        await deleteSlotEntry(99);

        expect(axios.delete).toHaveBeenCalledWith(
            expect.stringMatching(/\/api\/v2\/slot-entry\/99\/$/),
            expect.anything()
        );
    });
});
