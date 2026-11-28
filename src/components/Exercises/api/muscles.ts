import { Muscle, MuscleAdapter } from "@/components/Exercises/models/muscle";
import { fetchAll } from "@/core/lib/requests";
import { makeUrl } from "@/core/lib/url";

export const MUSCLES_PATH = 'muscle';

/*
 * Fetch all muscles
 */
export const getMuscles = async (): Promise<Muscle[]> => {
    const adapter = new MuscleAdapter();
    return await fetchAll(makeUrl(MUSCLES_PATH), json => adapter.fromJson(json));
};
