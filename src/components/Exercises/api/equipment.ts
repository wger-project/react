import { Equipment, EquipmentAdapter } from "@/components/Exercises/models/equipment";
import { ApiEquipmentType } from '@/types';
import { API_MAX_PAGE_SIZE } from "@/core/lib/consts";
import { fetchPaginated } from "@/core/lib/requests";
import { makeHeader, makeUrl } from "@/core/lib/url";

export const EQUIPMENT_PATH = 'equipment';


/*
 * Fetch all equipment
 */
export const getEquipment = async (): Promise<Equipment[]> => {
    const url = makeUrl(EQUIPMENT_PATH, { query: { limit: API_MAX_PAGE_SIZE } });
    const adapter = new EquipmentAdapter();
    const out: Equipment[] = [];

    for await (const page of fetchPaginated(url, makeHeader())) {
        out.push(...(page as ApiEquipmentType[]).map(e => adapter.fromJson(e)));
    }

    return out;
};
