/* eslint-disable camelcase */

import { editProfile, getProfile } from "@/components/User/api/profile";

export const REPORTED_TIMEZONE_KEY = 'wgerReportedTimezone';

/*
 * Reports the browser's IANA timezone to the user's profile.
 *
 * Only overwrites what this client reported itself: an empty profile field is
 * filled, a field still holding our last reported zone follows a device move,
 * and anything else (set manually in the preferences, or reported by another
 * device) is left alone.
 *
 * The last reported zone is kept in localStorage so that the common case, the
 * zone is unchanged, costs no request at all.
 */
export const syncProfileTimezone = async (): Promise<void> => {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!detected) {
        return;
    }

    const lastReported = localStorage.getItem(REPORTED_TIMEZONE_KEY);
    if (lastReported === detected) {
        return;
    }

    // Also the logged-in check: this returns null for anonymous visitors
    const profile = await getProfile();
    if (profile === null) {
        return;
    }

    if (profile.timeZone === detected) {
        localStorage.setItem(REPORTED_TIMEZONE_KEY, detected);
        return;
    }

    if (profile.timeZone === '' || profile.timeZone === lastReported) {
        await editProfile({ time_zone: detected });
        localStorage.setItem(REPORTED_TIMEZONE_KEY, detected);
    }
};
