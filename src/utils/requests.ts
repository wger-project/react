import axios, { AxiosRequestConfig } from 'axios';
import { makeHeader } from "utils/url";

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

