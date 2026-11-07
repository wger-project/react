import {
    addBaseConfig,
    AddBaseConfigParams,
    deleteBaseConfig,
    editBaseConfig,
    EditBaseConfigParams
} from "@/components/Routines/api/baseConfig";
import {
    addMaxNrOfSetsConfig,
    addMaxRepetitionsConfig,
    addMaxRestConfig,
    addMaxRirConfig,
    addMaxWeightConfig,
    addNrOfSetsConfig,
    addRepetitionsConfig,
    addRestConfig,
    addRirConfig,
    addWeightConfig,
    deleteMaxNrOfSetsConfig,
    deleteMaxRepetitionsConfig,
    deleteMaxRestConfig,
    deleteMaxRirConfig,
    deleteMaxWeightConfig,
    deleteNrOfSetsConfig,
    deleteRepetitionsConfig,
    deleteRestConfig,
    deleteRirConfig,
    deleteWeightConfig,
    editMaxNrOfSetsConfig,
    editMaxRepetitionsConfig,
    editMaxRestConfig,
    editMaxRirConfig,
    editMaxWeightConfig,
    editNrOfSetsConfig,
    editRepetitionsConfig,
    editRestConfig,
    editRirConfig,
    editWeightConfig
} from "@/components/Routines/api/config";
import { ApiPath } from "@/core/lib/consts";
import type { Mock } from 'vitest';

vi.mock("@/components/Routines/api/baseConfig", async () => {
    const originalModule = await vi.importActual<typeof import("@/components/Routines/api/baseConfig")>("@/components/Routines/api/baseConfig");
    return {
        __esModule: true,
        ...originalModule, // Include all original exports
        editBaseConfig: vi.fn(),
        addBaseConfig: vi.fn(),
        deleteBaseConfig: vi.fn(),
    };
});

/*
 * Every config type is the same three-liner around the base config, the only thing
 * that can go wrong is a copy-pasted api path. Listing them keeps all of them
 * covered instead of only the ones somebody remembered to write a test for.
 */
const CONFIG_TYPES = [
    {
        name: 'weight',
        path: ApiPath.WEIGHT_CONFIG,
        edit: editWeightConfig,
        add: addWeightConfig,
        remove: deleteWeightConfig
    },
    {
        name: 'max weight',
        path: ApiPath.MAX_WEIGHT_CONFIG,
        edit: editMaxWeightConfig,
        add: addMaxWeightConfig,
        remove: deleteMaxWeightConfig
    },
    {
        name: 'repetitions',
        path: ApiPath.REPETITIONS_CONFIG,
        edit: editRepetitionsConfig,
        add: addRepetitionsConfig,
        remove: deleteRepetitionsConfig
    },
    {
        name: 'max repetitions',
        path: ApiPath.MAX_REPS_CONFIG,
        edit: editMaxRepetitionsConfig,
        add: addMaxRepetitionsConfig,
        remove: deleteMaxRepetitionsConfig
    },
    {
        name: 'number of sets',
        path: ApiPath.NR_OF_SETS_CONFIG,
        edit: editNrOfSetsConfig,
        add: addNrOfSetsConfig,
        remove: deleteNrOfSetsConfig
    },
    {
        name: 'max number of sets',
        path: ApiPath.MAX_NR_OF_SETS_CONFIG,
        edit: editMaxNrOfSetsConfig,
        add: addMaxNrOfSetsConfig,
        remove: deleteMaxNrOfSetsConfig
    },
    { name: 'rir', path: ApiPath.RIR_CONFIG, edit: editRirConfig, add: addRirConfig, remove: deleteRirConfig },
    {
        name: 'max rir',
        path: ApiPath.MAX_RIR_CONFIG,
        edit: editMaxRirConfig,
        add: addMaxRirConfig,
        remove: deleteMaxRirConfig
    },
    { name: 'rest', path: ApiPath.REST_CONFIG, edit: editRestConfig, add: addRestConfig, remove: deleteRestConfig },
    {
        name: 'max rest',
        path: ApiPath.MAX_REST_CONFIG,
        edit: editMaxRestConfig,
        add: addMaxRestConfig,
        remove: deleteMaxRestConfig
    },
];

describe('Config Service', () => {

    const mockEditData: EditBaseConfigParams = { id: 1, value: 10 };
    const mockAddData: AddBaseConfigParams = { value: 10, slot_entry: 1 };

    beforeEach(() => {
        vi.clearAllMocks();

        (editBaseConfig as Mock).mockResolvedValue({ data: mockEditData });
        (addBaseConfig as Mock).mockResolvedValue({ id: 2, value: 200 });
        (deleteBaseConfig as Mock).mockResolvedValue(undefined);
    });

    test('all config types use a different api path', () => {
        const paths = CONFIG_TYPES.map(type => type.path);
        expect(new Set(paths).size).toBe(CONFIG_TYPES.length);
    });

    describe.each(CONFIG_TYPES)('$name config', ({ path, edit, add, remove }) => {

        it('edits through the base config with its own path', async () => {
            await edit(mockEditData);

            expect(editBaseConfig).toHaveBeenCalledTimes(1);
            expect(editBaseConfig).toHaveBeenCalledWith(mockEditData, path);
        });

        it('adds through the base config with its own path', async () => {
            await add(mockAddData);

            expect(addBaseConfig).toHaveBeenCalledTimes(1);
            expect(addBaseConfig).toHaveBeenCalledWith(mockAddData, path);
        });

        it('deletes through the base config with its own path', async () => {
            await remove(1);

            expect(deleteBaseConfig).toHaveBeenCalledTimes(1);
            expect(deleteBaseConfig).toHaveBeenCalledWith(1, path);
        });
    });
});
