import axios, { AxiosRequestConfig } from "axios";
import { fetchAll, fetchPaginated } from "@/core/lib/requests";
import { API_MAX_PAGE_SIZE } from "@/core/lib/consts";
import { makeHeader } from "@/core/lib/url";
import type { Mock } from 'vitest';

vi.mock('axios');

describe("test the pagination utilities", () => {

    beforeEach(() => {
        vi.resetAllMocks();
    });

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
        (axios.get as Mock).mockResolvedValueOnce(mockResponse1);
        (axios.get as Mock).mockResolvedValueOnce(mockResponse2);

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
        (axios.get as Mock).mockResolvedValue(mockResponse1);

        const headers: AxiosRequestConfig['headers'] = {
            Authorization: 'Bearer token',
        };

        const generator = fetchPaginated('/api/endpoint', headers);
        await generator.next();

        expect(axios.get).toHaveBeenCalledWith('/api/endpoint', expect.objectContaining({ headers }));
    });

    test('fetchAll parses the items of all pages and adds the maximum page size', async () => {
        (axios.get as Mock).mockResolvedValueOnce(mockResponse1);
        (axios.get as Mock).mockResolvedValueOnce(mockResponse2);

        const result = await fetchAll('/api/endpoint/?is_public=false', (n: number) => n * 10);

        expect((axios.get as Mock).mock.calls[0][0]).toBe(`/api/endpoint/?is_public=false&limit=${API_MAX_PAGE_SIZE}`);
        expect((axios.get as Mock).mock.calls[1][0]).toBe('/api/endpoint?page=2');
        expect(result).toEqual([10, 20, 30, 40, 50, 60]);
    });

    test('fetchAll keeps a limit set by the caller and builds a clean query otherwise', async () => {
        (axios.get as Mock).mockResolvedValue(mockResponse2);

        await fetchAll('/api/endpoint/?limit=300', (n: number) => n);
        await fetchAll('/api/endpoint/', (n: number) => n);
        await fetchAll('/api/endpoint/?', (n: number) => n);

        expect((axios.get as Mock).mock.calls[0][0]).toBe('/api/endpoint/?limit=300');
        expect((axios.get as Mock).mock.calls[1][0]).toBe(`/api/endpoint/?limit=${API_MAX_PAGE_SIZE}`);
        expect((axios.get as Mock).mock.calls[2][0]).toBe(`/api/endpoint/?limit=${API_MAX_PAGE_SIZE}`);
    });
});
