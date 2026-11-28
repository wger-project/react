import { API_MAX_PAGE_SIZE } from "@/core/lib/consts";
import { makeHeader } from "@/core/lib/url";
import axios, { AxiosRequestConfig } from 'axios';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function* fetchPaginated(url: string, headers?: AxiosRequestConfig['headers']): AsyncGenerator<any[], void> {

    if (headers == null) {
        headers = makeHeader();
    }

    while (true) {
        const response = await axios.get(url, { headers: headers });
        const data = response.data;
        yield data.results;

        url = data.next;
        if (!url) {
            break;
        }
    }
}

/*
 * Fetches every page of a list endpoint and parses each item with fromJson
 *
 * Requests API_MAX_PAGE_SIZE items per page unless the url sets its own limit.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchAll<T>(url: string, fromJson: (json: any) => T): Promise<T[]> {
    if (!/[?&]limit=/.test(url)) {
        const separator = !url.includes('?') ? '?' : url.endsWith('?') ? '' : '&';
        url += `${separator}limit=${API_MAX_PAGE_SIZE}`;
    }

    const out: T[] = [];
    for await (const page of fetchPaginated(url)) {
        out.push(...page.map(item => fromJson(item)));
    }
    return out;
}
