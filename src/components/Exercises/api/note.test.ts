import axios from "axios";
import { Note } from "@/components/Exercises/models/note";
import { addNote, deleteNote, editNote } from "@/components/Exercises/api/note";
import { responseNote } from "@/tests/exerciseTestdata";
import type { Mock } from "vitest";

vi.mock("axios");

describe("Note service tests", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("addNote POSTs the serialized note and returns the parsed Note", async () => {
        (axios.post as Mock).mockResolvedValue({ data: responseNote });
        const note = new Note(null, 7, "keep your back straight");

        const result = await addNote(note);

        expect(axios.post).toHaveBeenCalledTimes(1);
        const [url, body] = (axios.post as Mock).mock.calls[0];
        expect(url).toMatch(/\/api\/v2\/exercisecomment\/$/);
        expect(body).toEqual({
            id: null,
            translation: 7,
            comment: "keep your back straight",
        });
        expect(result).toBeInstanceOf(Note);
        expect(result.id).toBe(42);
        expect(result.translation).toBe(7);
        expect(result.note).toBe("keep your back straight");
    });

    test("editNote PATCHes /exercisecomment/<id>/", async () => {
        (axios.patch as Mock).mockResolvedValue({
            data: { ...responseNote, comment: "updated" },
        });
        const note = new Note(42, 7, "updated");

        const result = await editNote(note);

        expect(axios.patch).toHaveBeenCalledTimes(1);
        const [url, body] = (axios.patch as Mock).mock.calls[0];
        expect(url).toMatch(/\/api\/v2\/exercisecomment\/42\/$/);
        expect(body).toEqual({ id: 42, translation: 7, comment: "updated" });
        expect(result.note).toBe("updated");
    });

    test("deleteNote DELETEs /exercisecomment/<id>/", async () => {
        (axios.delete as Mock).mockResolvedValue({ status: 204 });

        await deleteNote(42);

        expect(axios.delete).toHaveBeenCalledTimes(1);
        expect(axios.delete).toHaveBeenCalledWith(
            expect.stringMatching(/\/api\/v2\/exercisecomment\/42\/$/),
            expect.anything()
        );
    });
});
