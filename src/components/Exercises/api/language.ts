import { Language, LanguageAdapter } from "@/components/Exercises/models/language";
import { ResponseType } from "@/core/api/responseType";
import { makeHeader, makeUrl } from "@/core/lib/url";
import { ApiLanguageType } from '@/types';
import axios from 'axios';

export const API_LANGUAGE_PATH = 'language';


/*
 * Fetch all languages
 */
export const getLanguages = async (): Promise<Language[]> => {
    const url = makeUrl(API_LANGUAGE_PATH, { query: { limit: 999 } });
    const { data: receivedLanguages } = await axios.get<ResponseType<ApiLanguageType>>(url, {
        headers: makeHeader(),
    });
    const adapter = new LanguageAdapter();
    return receivedLanguages.results.map(l => adapter.fromJson(l));
};