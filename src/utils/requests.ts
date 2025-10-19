import axios, { AxiosRequestConfig } from 'axios';
import { makeHeader } from "utils/url";

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

