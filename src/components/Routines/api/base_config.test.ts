import axios from "axios";
import { BaseConfigAdapter } from "@/components/Routines/models/BaseConfig";
import {
    addBaseConfig,
    AddBaseConfigParams,
    deleteBaseConfig,
    editBaseConfig,
    EditBaseConfigParams,
    processBaseConfigs,
} from "@/components/Routines/api/base_config";
import { ApiPath } from "@/core/lib/consts";
import type { Mock, Mocked } from 'vitest';

vi.mock('axios');
const mockedAxios = axios as Mocked<typeof axios>;

describe('editBaseConfig', () => {
    const mockBaseConfigData = {
        id: 1,
        value: 100,
        // eslint-disable-next-line camelcase
        slot_entry: 1,
    };

    const mockEditBaseConfigParams: EditBaseConfigParams = {
        id: 1,
        value: 120,
    };

    const mockUrl = '/api/baseconfig/';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('should update a base config and return the updated config', async () => {
        mockedAxios.patch.mockResolvedValue({ data: mockBaseConfigData });

        const updatedConfig = await editBaseConfig(mockEditBaseConfigParams, mockUrl);

        expect(axios.patch).toHaveBeenCalledTimes(1);
        expect(axios.patch).toHaveBeenCalledWith(
            expect.any(String),
            mockEditBaseConfigParams,
            expect.any(Object)
        );
        expect(updatedConfig).toEqual(new BaseConfigAdapter().fromJson(mockBaseConfigData));
    });

    test('should handle errors gracefully', async () => {
        const errorMessage = 'Network Error';
        mockedAxios.patch.mockRejectedValue(new Error(errorMessage));

        await expect(editBaseConfig(mockEditBaseConfigParams, mockUrl)).rejects.toThrow(errorMessage);
        expect(axios.patch).toHaveBeenCalledTimes(1);
    });
});

describe('addBaseConfig', () => {
    const apiPath = ApiPath.WEIGHT_CONFIG;
    const params: AddBaseConfigParams = {
        // eslint-disable-next-line camelcase
        slot_entry: 7,
        value: 100,
        iteration: 1,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('POSTs the params and returns the parsed config', async () => {
        const apiResponse = { id: 99, value: 100, slot_entry: 7 }; // eslint-disable-line camelcase
        mockedAxios.post.mockResolvedValue({ data: apiResponse });

        const result = await addBaseConfig(params, apiPath);

        expect(axios.post).toHaveBeenCalledTimes(1);
        const [url, body] = mockedAxios.post.mock.calls[0];
        expect(url).toMatch(/\/api\/v2\/weight-config\/$/);
        expect(body).toBe(params);
        expect(result).toEqual(new BaseConfigAdapter().fromJson(apiResponse));
    });
});

describe('deleteBaseConfig', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('DELETEs at the configured path with the id in the URL', async () => {
        mockedAxios.delete.mockResolvedValue({ status: 204 });

        await deleteBaseConfig(13, ApiPath.WEIGHT_CONFIG);

        expect(axios.delete).toHaveBeenCalledWith(
            expect.stringMatching(/\/api\/v2\/weight-config\/13\/$/),
            expect.anything()
        );
    });
});

describe('processBaseConfigs', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Generic happy-path mocks for the inner CRUD operations
        mockedAxios.post.mockResolvedValue({ data: { id: 1, value: 0, slot_entry: 1 } });
        mockedAxios.patch.mockResolvedValue({ data: { id: 1, value: 0, slot_entry: 1 } });
        mockedAxios.delete.mockResolvedValue({ status: 204 });
    });

    test('runs add/edit/delete operations for the values bucket only when present', async () => {
        await processBaseConfigs({
            values: {
                toAdd: [
                    { slot_entry: 1, value: 100 }, // eslint-disable-line camelcase
                    { slot_entry: 1, value: 110 }, // eslint-disable-line camelcase
                ],
                toEdit: [{ id: 5, value: 90 }],
                toDelete: [42],
                apiPath: ApiPath.WEIGHT_CONFIG,
            },
            // maxValues omitted - the orchestrator must not run anything for it
        });

        expect(axios.post).toHaveBeenCalledTimes(2);
        expect(axios.patch).toHaveBeenCalledTimes(1);
        expect(axios.delete).toHaveBeenCalledTimes(1);
    });

    test('runs both buckets when both are passed', async () => {
        await processBaseConfigs({
            values: {
                toAdd: [{ slot_entry: 1, value: 100 }], // eslint-disable-line camelcase
                toEdit: [],
                toDelete: [],
                apiPath: ApiPath.WEIGHT_CONFIG,
            },
            maxValues: {
                toAdd: [],
                toEdit: [],
                toDelete: [42, 43],
                apiPath: ApiPath.MAX_WEIGHT_CONFIG,
            },
        });

        expect(axios.post).toHaveBeenCalledTimes(1);
        expect(axios.delete).toHaveBeenCalledTimes(2);
        // The two delete calls must hit the max-weight-config endpoint
        const deleteUrls = (axios.delete as Mock).mock.calls.map(([u]) => u as string);
        expect(deleteUrls.every(u => /\/max-weight-config\//.test(u))).toBe(true);
    });

    test('with no buckets passed, no requests fire', async () => {
        await processBaseConfigs({});

        expect(axios.post).not.toHaveBeenCalled();
        expect(axios.patch).not.toHaveBeenCalled();
        expect(axios.delete).not.toHaveBeenCalled();
    });
});
