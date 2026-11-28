import axios from "axios";
import { checkLanguage } from "@/core/api/languageCheck";
import type { Mock } from "vitest";

vi.mock("axios");

describe("checkLanguage service tests", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("POSTs to /check-language/ with the input and the languageId", async () => {
        const apiResponse = { result: true };
        (axios.post as Mock).mockResolvedValue({ data: apiResponse });

        const result = await checkLanguage({ input: "Hello world", languageId: 2 });

        expect(axios.post).toHaveBeenCalledTimes(1);
        const [url, body] = (axios.post as Mock).mock.calls[0];
        expect(url).toMatch(/\/api\/v2\/check-language\/$/);
        expect(body).toEqual({ input: "Hello world", language: 2 });
        // The language code key must NOT be present when languageId is given
        expect(body).not.toHaveProperty("language_code");
        expect(result).toBe(apiResponse);
    });

    test("uses the snake_case language_code when no languageId is provided", async () => {
        (axios.post as Mock).mockResolvedValue({ data: { result: true } });

        await checkLanguage({ input: "Bonjour", languageCode: "fr" });

        const [, body] = (axios.post as Mock).mock.calls[0];
        // The serializer only knows 'language_code', a camelCase key is silently
        // dropped and the request fails with "provide a language ID or code"
        expect(body).toEqual({ input: "Bonjour", language_code: "fr" });
        // The numeric 'language' key must NOT be present
        expect(body).not.toHaveProperty("language");
    });

    test("forwards the response body unchanged", async () => {
        // Language mismatches arrive as a 400 and are turned into an envelope one
        // layer up, in useLanguageCheckQuery
        const apiResponse = { result: true };
        (axios.post as Mock).mockResolvedValue({ data: apiResponse });

        const result = await checkLanguage({ input: "Hola", languageId: 2 });

        expect(result).toBe(apiResponse);
    });
});
