import axios from 'axios';
import { ApiEquipmentType } from 'types';
import { ResponseType } from "./responseType";
import { makeHeader, makeUrl } from "utils/url";
import { Equipment, EquipmentAdapter } from "components/Exercises/models/equipment";

export const EQUIPMENT_PATH = 'equipment';


/*
 * Fetch all equipment
 */
export const getEquipment = async (): Promise<Equipment[]> => {
    const url = makeUrl(EQUIPMENT_PATH);
    const { data: receivedEquipment } = await axios.get<ResponseType<ApiEquipmentType>>(url, {
        headers: makeHeader(),
    });
    const adapter = new EquipmentAdapter();
    return receivedEquipment.results.map(e => adapter.fromJson(e));
};
