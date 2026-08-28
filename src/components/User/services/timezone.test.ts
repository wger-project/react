import { editProfile, getProfile } from "@/components/User/api/profile";
import { Profile } from "@/components/User/models/profile";
import { REPORTED_TIMEZONE_KEY, syncProfileTimezone } from "@/components/User/services/timezone";
import { testProfileDataVerified } from "@/tests/userTestdata";
import type { Mock } from 'vitest';

vi.mock("@/components/User/api/profile");

const DETECTED = Intl.DateTimeFormat().resolvedOptions().timeZone;

const profileWithZone = (timeZone: string) => new Profile({ ...testProfileDataVerified, timeZone });

describe("syncProfileTimezone", () => {

    beforeEach(() => {
        vi.resetAllMocks();
        localStorage.clear();
    });

    test('fills an empty profile field and remembers the report', async () => {
        (getProfile as Mock).mockResolvedValue(profileWithZone(''));

        await syncProfileTimezone();

        expect(editProfile).toHaveBeenCalledWith({ time_zone: DETECTED });
        expect(localStorage.getItem(REPORTED_TIMEZONE_KEY)).toEqual(DETECTED);
    });

    test('an unchanged zone costs no request', async () => {
        localStorage.setItem(REPORTED_TIMEZONE_KEY, DETECTED);

        await syncProfileTimezone();

        expect(getProfile).not.toHaveBeenCalled();
        expect(editProfile).not.toHaveBeenCalled();
    });

    test('follows a device move when the profile still holds our old report', async () => {
        localStorage.setItem(REPORTED_TIMEZONE_KEY, 'America/Denver');
        (getProfile as Mock).mockResolvedValue(profileWithZone('America/Denver'));

        await syncProfileTimezone();

        expect(editProfile).toHaveBeenCalledWith({ time_zone: DETECTED });
    });

    test('leaves a zone alone that someone else set', async () => {
        (getProfile as Mock).mockResolvedValue(profileWithZone('Pacific/Auckland'));

        await syncProfileTimezone();

        expect(editProfile).not.toHaveBeenCalled();
        expect(localStorage.getItem(REPORTED_TIMEZONE_KEY)).toBeNull();
    });

    test('does nothing for anonymous visitors', async () => {
        (getProfile as Mock).mockResolvedValue(null);

        await syncProfileTimezone();

        expect(editProfile).not.toHaveBeenCalled();
    });

    test('only remembers a zone the profile already matches', async () => {
        (getProfile as Mock).mockResolvedValue(profileWithZone(DETECTED));

        await syncProfileTimezone();

        expect(editProfile).not.toHaveBeenCalled();
        expect(localStorage.getItem(REPORTED_TIMEZONE_KEY)).toEqual(DETECTED);
    });
});
