import axios from "axios";
import { checkLanguage } from "@/core/api/languageCheck";
import type { Mock } from "vitest";

vi.mock("axios");

describe("checkLanguage service tests", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("POSTs to /check-language/ with the input and the languageId", async () => {
        const apiResponse = { success: true };
        (axios.post as Mock).mockResolvedValue({ data: apiResponse });

        const result = await checkLanguage({ input: "Hello world", languageId: 2 });

        expect(axios.post).toHaveBeenCalledTimes(1);
        const [url, body] = (axios.post as Mock).mock.calls[0];
        expect(url).toMatch(/\/api\/v2\/check-language\/$/);
        expect(body).toEqual({ input: "Hello world", language: 2 });
        // The 'languageCode' key must NOT be present when languageId is given
        expect(body).not.toHaveProperty("languageCode");
        expect(result).toBe(apiResponse);
    });

    test("uses languageCode when no languageId is provided", async () => {
        (axios.post as Mock).mockResolvedValue({ data: { success: true } });

        await checkLanguage({ input: "Bonjour", languageCode: "fr" });

        const [, body] = (axios.post as Mock).mock.calls[0];
        expect(body).toEqual({ input: "Bonjour", languageCode: "fr" });
        // The numeric 'language' key must NOT be present
        expect(body).not.toHaveProperty("language");
    });

    test("forwards the response data unchanged (incl. error envelopes)", async () => {
        // The wger API returns a 'check' object on language mismatch.
        const errorEnvelope = { check: { message: "this looks like Spanish" } };
        (axios.post as Mock).mockResolvedValue({ data: errorEnvelope });

        const result = await checkLanguage({ input: "Hola", languageId: 2 });

        expect(result).toBe(errorEnvelope);
    });
});
