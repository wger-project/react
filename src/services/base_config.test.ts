import axios from "axios";
import { BaseConfigAdapter } from "components/WorkoutRoutines/models/BaseConfig";
import { editBaseConfig, EditBaseConfigParams } from "services/base_config";

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

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
        jest.clearAllMocks();
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
