import {
    addMaxRepsConfig,
    addMaxRestConfig,
    addMaxWeightConfig,
    addNrOfSetsConfig,
    addRepsConfig,
    addRestConfig,
    addRirConfig,
    addWeightConfig,
    deleteMaxRepsConfig,
    deleteMaxRestConfig,
    deleteMaxWeightConfig,
    deleteNrOfSetsConfig,
    deleteRepsConfig,
    deleteRestConfig,
    deleteRirConfig,
    deleteWeightConfig,
    editMaxRepsConfig,
    editMaxRestConfig,
    editMaxWeightConfig,
    editNrOfSetsConfig,
    editRepsConfig,
    editRestConfig,
    editRirConfig,
    editWeightConfig
} from "services";
import {
    addBaseConfig,
    AddBaseConfigParams,
    deleteBaseConfig,
    editBaseConfig,
    EditBaseConfigParams
} from "services/base_config";
import { ApiPath } from "utils/consts";

jest.mock("services/base_config", () => {
    const originalModule = jest.requireActual("services/base_config");
    return {
        __esModule: true,
        ...originalModule, // Include all original exports
        editBaseConfig: jest.fn(),
        addBaseConfig: jest.fn(),
        deleteBaseConfig: jest.fn(),
    };
});

describe('Config Service - Edit Functions', () => {
    const mockEditData: EditBaseConfigParams = { id: 1, value: 10 };
    const mockAddData: AddBaseConfigParams = { value: 10, slot_config: 1 };


    beforeEach(() => {
        jest.clearAllMocks();

        (editBaseConfig as jest.Mock).mockResolvedValue({ data: mockEditData });
        (addBaseConfig as jest.Mock).mockResolvedValue({ id: 2, value: 200 });
        (deleteBaseConfig as jest.Mock).mockResolvedValue(undefined);

    });

    it('should call editBaseConfig with correct params for editWeightConfig', async () => {
        await editWeightConfig(mockEditData);
        expect(editBaseConfig).toHaveBeenCalledTimes(1);
        expect(editBaseConfig).toHaveBeenCalledWith(mockEditData, ApiPath.WEIGHT_CONFIG);
    });

    it('should call addBaseConfig with correct params for addWeightConfig', async () => {
        await addWeightConfig(mockAddData);
        expect(addBaseConfig).toHaveBeenCalledTimes(1);
        expect(addBaseConfig).toHaveBeenCalledWith(mockAddData, ApiPath.WEIGHT_CONFIG);
    });

    it('should call deleteBaseConfig with correct params for deleteWeightConfig', async () => {
        const id = 1;
        await deleteWeightConfig(id);
        expect(deleteBaseConfig).toHaveBeenCalledTimes(1);
        expect(deleteBaseConfig).toHaveBeenCalledWith(id, ApiPath.WEIGHT_CONFIG);
    });

    it('should call editBaseConfig with correct params for editMaxWeightConfig', async () => {
        await editMaxWeightConfig(mockEditData);
        expect(editBaseConfig).toHaveBeenCalledTimes(1);
        expect(editBaseConfig).toHaveBeenCalledWith(mockEditData, ApiPath.MAX_WEIGHT_CONFIG);
    });

    it('should call addBaseConfig with correct params for addMaxWeightConfig', async () => {
        await addMaxWeightConfig(mockAddData);
        expect(addBaseConfig).toHaveBeenCalledTimes(1);
        expect(addBaseConfig).toHaveBeenCalledWith(mockAddData, ApiPath.MAX_WEIGHT_CONFIG);
    });

    it('should call deleteBaseConfig with correct params for deleteMaxWeightConfig', async () => {
        const id = 1;
        await deleteMaxWeightConfig(id);
        expect(deleteBaseConfig).toHaveBeenCalledTimes(1);
        expect(deleteBaseConfig).toHaveBeenCalledWith(id, ApiPath.MAX_WEIGHT_CONFIG);
    });

    it('should call editBaseConfig with correct params for editRepsConfig', async () => {
        await editRepsConfig(mockEditData);
        expect(editBaseConfig).toHaveBeenCalledTimes(1);
        expect(editBaseConfig).toHaveBeenCalledWith(mockEditData, ApiPath.REPS_CONFIG);
    });

    it('should call addBaseConfig with correct params for addRepsConfig', async () => {
        await addRepsConfig(mockAddData);
        expect(addBaseConfig).toHaveBeenCalledTimes(1);
        expect(addBaseConfig).toHaveBeenCalledWith(mockAddData, ApiPath.REPS_CONFIG);
    });

    it('should call deleteBaseConfig with correct params for deleteRepsConfig', async () => {
        const id = 1;
        await deleteRepsConfig(id);
        expect(deleteBaseConfig).toHaveBeenCalledTimes(1);
        expect(deleteBaseConfig).toHaveBeenCalledWith(id, ApiPath.REPS_CONFIG);
    });

    it('should call editBaseConfig with correct params for editMaxRepsConfig', async () => {
        await editMaxRepsConfig(mockEditData);
        expect(editBaseConfig).toHaveBeenCalledTimes(1);
        expect(editBaseConfig).toHaveBeenCalledWith(mockEditData, ApiPath.MAX_REPS_CONFIG);
    });

    it('should call addBaseConfig with correct params for addMaxRepsConfig', async () => {
        await addMaxRepsConfig(mockAddData);
        expect(addBaseConfig).toHaveBeenCalledTimes(1);
        expect(addBaseConfig).toHaveBeenCalledWith(mockAddData, ApiPath.MAX_REPS_CONFIG);
    });

    it('should call deleteBaseConfig with correct params for deleteMaxRepsConfig', async () => {
        const id = 1;
        await deleteMaxRepsConfig(id);
        expect(deleteBaseConfig).toHaveBeenCalledTimes(1);
        expect(deleteBaseConfig).toHaveBeenCalledWith(id, ApiPath.MAX_REPS_CONFIG);
    });

    it('should call editBaseConfig with correct params for editNrOfSetsConfig', async () => {
        await editNrOfSetsConfig(mockEditData);
        expect(editBaseConfig).toHaveBeenCalledTimes(1);
        expect(editBaseConfig).toHaveBeenCalledWith(mockEditData, ApiPath.NR_OF_SETS_CONFIG);
    });

    it('should call addBaseConfig with correct params for addNrOfSetsConfig', async () => {
        await addNrOfSetsConfig(mockAddData);
        expect(addBaseConfig).toHaveBeenCalledTimes(1);
        expect(addBaseConfig).toHaveBeenCalledWith(mockAddData, ApiPath.NR_OF_SETS_CONFIG);
    });

    it('should call deleteBaseConfig with correct params for deleteNrOfSetsConfig', async () => {
        const id = 1;
        await deleteNrOfSetsConfig(id);
        expect(deleteBaseConfig).toHaveBeenCalledTimes(1);
        expect(deleteBaseConfig).toHaveBeenCalledWith(id, ApiPath.NR_OF_SETS_CONFIG);
    });

    it('should call editBaseConfig with correct params for editRirConfig', async () => {
        await editRirConfig(mockEditData);
        expect(editBaseConfig).toHaveBeenCalledTimes(1);
        expect(editBaseConfig).toHaveBeenCalledWith(mockEditData, ApiPath.RIR_CONFIG);
    });

    it('should call addBaseConfig with correct params for addRirConfig', async () => {
        await addRirConfig(mockAddData);
        expect(addBaseConfig).toHaveBeenCalledTimes(1);
        expect(addBaseConfig).toHaveBeenCalledWith(mockAddData, ApiPath.RIR_CONFIG);
    });

    it('should call deleteBaseConfig with correct params for deleteRirConfig', async () => {
        const id = 1;
        await deleteRirConfig(id);
        expect(deleteBaseConfig).toHaveBeenCalledTimes(1);
        expect(deleteBaseConfig).toHaveBeenCalledWith(id, ApiPath.RIR_CONFIG);
    });

    it('should call editBaseConfig with correct params for editRestConfig', async () => {
        await editRestConfig(mockEditData);
        expect(editBaseConfig).toHaveBeenCalledTimes(1);
        expect(editBaseConfig).toHaveBeenCalledWith(mockEditData, ApiPath.REST_CONFIG);
    });

    it('should call addBaseConfig with correct params for addRestConfig', async () => {
        await addRestConfig(mockAddData);
        expect(addBaseConfig).toHaveBeenCalledTimes(1);
        expect(addBaseConfig).toHaveBeenCalledWith(mockAddData, ApiPath.REST_CONFIG);
    });

    it('should call deleteBaseConfig with correct params for deleteRestConfig', async () => {
        const id = 1;
        await deleteRestConfig(id);
        expect(deleteBaseConfig).toHaveBeenCalledTimes(1);
        expect(deleteBaseConfig).toHaveBeenCalledWith(id, ApiPath.REST_CONFIG);
    });

    it('should call editBaseConfig with correct params for editMaxRestConfig', async () => {
        await editMaxRestConfig(mockEditData);
        expect(editBaseConfig).toHaveBeenCalledTimes(1);
        expect(editBaseConfig).toHaveBeenCalledWith(mockEditData, ApiPath.MAX_REST_CONFIG);
    });

    it('should call addBaseConfig with correct params for addMaxRestConfig', async () => {
        await addMaxRestConfig(mockAddData);
        expect(addBaseConfig).toHaveBeenCalledTimes(1);
        expect(addBaseConfig).toHaveBeenCalledWith(mockAddData, ApiPath.MAX_REST_CONFIG);
    });

    it('should call deleteBaseConfig with correct params for deleteMaxRestConfig', async () => {
        const id = 1;
        await deleteMaxRestConfig(id);
        expect(deleteBaseConfig).toHaveBeenCalledTimes(1);
        expect(deleteBaseConfig).toHaveBeenCalledWith(id, ApiPath.MAX_REST_CONFIG);
    });
});