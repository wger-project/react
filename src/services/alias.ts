import axios from 'axios';
import { makeHeader, makeUrl } from "utils/url";
import { Alias, AliasAdapter } from "components/Exercises/models/alias";

export const ALIAS_PATH = 'exercisealias';


/*
 * Fetch all categories
 */
export const postAlias = async (exerciseId: number, alias: string): Promise<Alias> => {
    const url = makeUrl(ALIAS_PATH);
    const response = await axios.post(url, { exercise: exerciseId, alias: alias }, {
        headers: makeHeader(),
    });
    const adapter = new AliasAdapter();
    return adapter.fromJson(response.data);
};

