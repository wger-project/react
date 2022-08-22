import axios from 'axios';
import { makeHeader, makeUrl } from "utils/url";
import { Alias, AliasAdapter } from "components/Exercises/models/alias";

export const ALIAS_PATH = 'exercisealias';


/*
 * Fetch all aliases
 */
export const postAlias = async (exerciseId: number, alias: string): Promise<Alias> => {
    const url = makeUrl(ALIAS_PATH);
    const response = await axios.post(
        url,
        { exercise: exerciseId, alias: alias },
        { headers: makeHeader() }
    );
    const adapter = new AliasAdapter();
    return adapter.fromJson(response.data);
};

/*
 * Delete a given alias
 */
export const deleteAlias = async (aliasId: number): Promise<number> => {
    const response = await axios.delete(
        makeUrl(ALIAS_PATH, { id: aliasId }),
        { headers: makeHeader() }
    );

    return response.status;
};


