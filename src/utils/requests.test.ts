import axios, { AxiosRequestConfig } from "axios";
import { fetchPaginated } from "utils/requests";
import { makeHeader } from "utils/url";

jest.mock('axios');

describe("test the pagination utilities", () => {

    const mockResponse1 = {
        data: {
            results: [1, 2, 3],
            next: '/api/endpoint?page=2',
        },
    };

    const mockResponse2 = {
        data: {
            results: [4, 5, 6],
            next: null,
        },
    };


    test('should fetch and yield results from all pages', async () => {
        (axios.get as jest.Mock).mockResolvedValueOnce(mockResponse1);
        (axios.get as jest.Mock).mockResolvedValueOnce(mockResponse2);

        const generator = fetchPaginated('/api/endpoint');
        const headers = makeHeader();

        const results = [];
        for await (const page of generator) {
            results.push(...page);
        }

        expect(axios.get).toHaveBeenCalledTimes(2);
        expect(axios.get).toHaveBeenCalledWith(
            '/api/endpoint?page=2',
            expect.objectContaining({ headers })
        );
        expect(axios.get).toHaveBeenCalledWith(
            '/api/endpoint',
            expect.objectContaining({ headers })
        );
        expect(results).toEqual([1, 2, 3, 4, 5, 6]);

    });

    test('should use custom headers when provided', async () => {
        (axios.get as jest.Mock).mockResolvedValue(mockResponse1);

        const headers: AxiosRequestConfig['headers'] = {
            Authorization: 'Bearer token',
        };

        const generator = fetchPaginated('/api/endpoint', headers);
        await generator.next();

        expect(axios.get).toHaveBeenCalledWith('/api/endpoint', expect.objectContaining({ headers }));
    });
});
