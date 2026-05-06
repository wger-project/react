import axios from 'axios';
import { Language, LanguageAdapter } from "@/components/Exercises/models/language";
import { ApiLanguageType } from '@/types';
import { makeHeader, makeUrl } from "@/core/lib/url";
import { ResponseType } from "@/core/api/responseType";

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