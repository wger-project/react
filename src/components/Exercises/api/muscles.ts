import { Muscle, MuscleAdapter } from "@/components/Exercises/models/muscle";
import { ApiMuscleType } from '@/types';
import { API_MAX_PAGE_SIZE } from "@/core/lib/consts";
import { fetchPaginated } from "@/core/lib/requests";
import { makeHeader, makeUrl } from "@/core/lib/url";

export const MUSCLES_PATH = 'muscle';

/*
 * Fetch all muscles
 *
 * Follows the pagination, so muscles beyond the server's default page size
 * (e.g. ones added by an admin) are not dropped.
 */
export const getMuscles = async (): Promise<Muscle[]> => {
    const url = makeUrl(MUSCLES_PATH, { query: { limit: API_MAX_PAGE_SIZE } });
    const adapter = new MuscleAdapter();
    const out: Muscle[] = [];

    for await (const page of fetchPaginated(url, makeHeader())) {
        out.push(...(page as ApiMuscleType[]).map(m => adapter.fromJson(m)));
    }

    return out;
};
