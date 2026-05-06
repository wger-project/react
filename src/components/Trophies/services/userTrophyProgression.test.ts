import axios from "axios";
import { UserTrophyProgression } from "@/components/Trophies/models/userTrophyProgression";
import { getUserTrophyProgression } from "@/components/Trophies/services/userTrophyProgression";
import { responseUserTrophyProgression } from "@/tests/trophies/trophiesTestData";
import type { Mock } from "vitest";

vi.mock("axios");

describe("userTrophyProgression service tests", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("getUserTrophyProgression hits /trophy/progress/ and maps each item", async () => {
        (axios.get as Mock).mockResolvedValue({ data: responseUserTrophyProgression });

        const result = await getUserTrophyProgression();

        expect(axios.get).toHaveBeenCalledTimes(1);
        const [url] = (axios.get as Mock).mock.calls[0];
        expect(url).toMatch(/\/api\/v2\/trophy\/progress\/$/);

        expect(result).toHaveLength(2);
        expect(result.every(t => t instanceof UserTrophyProgression)).toBe(true);
        // Earned trophy: earnedAt is a Date
        expect(result[0].isEarned).toBe(true);
        expect(result[0].earnedAt).toEqual(new Date("2025-12-19T10:00:00Z"));
        // Unearned trophy: earnedAt is null (the adapter handles the null branch)
        expect(result[1].isEarned).toBe(false);
        expect(result[1].earnedAt).toBeNull();
        expect(result[1].progressDisplay).toBe("4/30");
    });

    test("returns an empty list for an empty response", async () => {
        (axios.get as Mock).mockResolvedValue({ data: [] });

        const result = await getUserTrophyProgression();

        expect(result).toEqual([]);
    });
});
