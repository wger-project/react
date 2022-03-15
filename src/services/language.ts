import axios from 'axios';
import { ApiLanguageType } from 'types';
import { ResponseType } from "./responseType";
import { makeHeader, makeUrl } from "utils/url";
import { Language, LanguageAdapter } from "components/Exercises/models/language";

export const API_LANGUAGE_PATH = 'language';


/*
 * Fetch all languages
 */
export const getLanguages = async (): Promise<Language[]> => {
    const url = makeUrl(API_LANGUAGE_PATH);
    const { data: receivedLanguages } = await axios.get<ResponseType<ApiLanguageType>>(url, {
        headers: makeHeader(),
    });
    const adapter = new LanguageAdapter();
    return receivedLanguages.results.map(l => adapter.fromJson(l));
};

/*
 * Searches for the language with the given short name
 */
export const getLanguageByShortName = (name: string, availableLanguages: Language[]): Language | undefined => {

    // If the name is in the form of "en-US", remove the country code
    const shortName = name.split('-')[0];

    const language = availableLanguages.find(l => l.nameShort === shortName);
    if (language) {
        return language;
    }
    return undefined;
};