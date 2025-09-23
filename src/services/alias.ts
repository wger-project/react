import axios from 'axios';
import { Alias, AliasAdapter } from "components/Exercises/models/alias";
import { makeHeader, makeUrl } from "utils/url";

export const ALIAS_PATH = 'exercisealias';


/*
 * Create a new alias
 */
export const postAlias = async (translationId: number, alias: string): Promise<Alias> => {
    const url = makeUrl(ALIAS_PATH);
    const response = await axios.post(
        url,
        { translation: translationId, alias: alias },
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


