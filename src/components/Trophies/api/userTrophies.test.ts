import axios from "axios";
import { UserTrophy } from "@/components/Trophies/models/userTrophy";
import { getUserTrophies, setTrophyAsNotified } from "@/components/Trophies/api/userTrophies";
import { responseUserTrophies } from "@/tests/trophies/trophiesTestData";
import type { Mock } from "vitest";

vi.mock("axios");

describe("userTrophies service tests", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("getUserTrophies hits /user-trophy/ and parses paginated results", async () => {
        (axios.get as Mock).mockResolvedValue({ data: responseUserTrophies });

        const result = await getUserTrophies();

        const url = (axios.get as Mock).mock.calls[0][0] as string;
        expect(url).toMatch(/\/api\/v2\/user-trophy\//);
        expect(url).toContain("limit=");
        expect(result).toHaveLength(1);
        expect(result[0]).toBeInstanceOf(UserTrophy);
        expect(result[0].id).toBe(1);
        expect(result[0].progress).toBe(100);
        expect(result[0].isNotified).toBe(false);
        expect(result[0].trophy.name).toBe("Beginner");
    });

    test("setTrophyAsNotified PATCHes /user-trophy/<id>/ with is_notified: true", async () => {
        (axios.patch as Mock).mockResolvedValue({ status: 200 });

        await setTrophyAsNotified(1);

        expect(axios.patch).toHaveBeenCalledTimes(1);
        const [url, body] = (axios.patch as Mock).mock.calls[0];
        expect(url).toMatch(/\/api\/v2\/user-trophy\/1\/$/);
        expect(body).toEqual({ id: 1, "is_notified": true });
    });
});
