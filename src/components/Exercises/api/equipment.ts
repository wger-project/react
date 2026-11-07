import { Equipment, EquipmentAdapter } from "@/components/Exercises/models/equipment";
import { fetchAll } from "@/core/lib/requests";
import { makeUrl } from "@/core/lib/url";

export const EQUIPMENT_PATH = 'equipment';


/*
 * Fetch all equipment
 */
export const getEquipment = async (): Promise<Equipment[]> => {
    const adapter = new EquipmentAdapter();
    return await fetchAll(makeUrl(EQUIPMENT_PATH), json => adapter.fromJson(json));
};
