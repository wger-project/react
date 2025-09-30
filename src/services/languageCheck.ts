import axios from 'axios';
import { makeHeader, makeUrl } from "utils/url";

export const LANGUAGE_DETECTION = 'check-language';


/*
 * Check if an input string is in a particular language.
 *
 * Either languageId or languageCode must be provided.
 */
export type LanguageCheckInput =
    | { input: string; languageId: number; languageCode?: string }
    | { input: string; languageCode: string; languageId?: number };

export const checkLanguage = async (data: LanguageCheckInput): Promise<object> => {

    const url = makeUrl(LANGUAGE_DETECTION);
    const payload = {
        input: data.input,
        ...(data.languageId !== undefined
            ? { language: data.languageId }
            : { languageCode: data.languageCode })
    };

    const response = await axios.post(
        url,
        payload,
        { headers: makeHeader() },
    );

    return response.data;
};