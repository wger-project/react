import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import { BaseConfig } from 'components/WorkoutRoutines/models/BaseConfig';

import { ConfigDetailsField } from 'components/WorkoutRoutines/widgets/forms/BaseConfigForm';
import React from 'react';
import { testQueryClient } from "tests/queryClient";


jest.mock('utils/consts', () => {
    return {
        DEBOUNCE_ROUTINE_FORMS: '5'
    };
});


jest.mock('components/WorkoutRoutines/queries', () => ({
    useEditWeightConfigQuery: jest.fn(() => ({ mutate: editMutation })),
    useAddWeightConfigQuery: jest.fn(() => ({ mutate: addMutation })),
    useDeleteWeightConfigQuery: jest.fn(() => ({ mutate: deleteMutation })),
    useEditMaxWeightConfigQuery: jest.fn(() => ({ mutate: editMutation })),
    useAddMaxWeightConfigQuery: jest.fn(() => ({ mutate: addMutation })),
    useDeleteMaxWeightConfigQuery: jest.fn(() => ({ mutate: deleteMutation })),
    useEditRepsConfigQuery: jest.fn(() => ({ mutate: editMutation })),
    useAddRepsConfigQuery: jest.fn(() => ({ mutate: addMutation })),
    useDeleteRepsConfigQuery: jest.fn(() => ({ mutate: deleteMutation })),
    useEditMaxRepsConfigQuery: jest.fn(() => ({ mutate: editMutation })),
    useAddMaxRepsConfigQuery: jest.fn(() => ({ mutate: addMutation })),
    useDeleteMaxRepsConfigQuery: jest.fn(() => ({ mutate: deleteMutation })),
    useEditNrOfSetsConfigQuery: jest.fn(() => ({ mutate: editMutation })),
    useAddNrOfSetsConfigQuery: jest.fn(() => ({ mutate: addMutation })),
    useDeleteNrOfSetsConfigQuery: jest.fn(() => ({ mutate: deleteMutation })),
    useEditRestConfigQuery: jest.fn(() => ({ mutate: editMutation })),
    useAddRestConfigQuery: jest.fn(() => ({ mutate: addMutation })),
    useDeleteRestConfigQuery: jest.fn(() => ({ mutate: deleteMutation })),
    useEditMaxRestConfigQuery: jest.fn(() => ({ mutate: editMutation })),
    useAddMaxRestConfigQuery: jest.fn(() => ({ mutate: addMutation })),
    useDeleteMaxRestConfigQuery: jest.fn(() => ({ mutate: deleteMutation })),
    useEditRiRConfigQuery: jest.fn(() => ({ mutate: editMutation })),
    useAddRiRConfigQuery: jest.fn(() => ({ mutate: addMutation })),
    useDeleteRiRConfigQuery: jest.fn(() => ({ mutate: deleteMutation })),
}));


const editMutation = jest.fn();
const addMutation = jest.fn();
const deleteMutation = jest.fn();

const DEBOUNCE_WAIT = 10;

describe('ConfigDetailsField Component', () => {
    const routineId = 1;
    const slotId = 2;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    const testConfigTypes = ['weight', 'max-weight', 'reps', 'max-reps', 'sets', 'rest', 'max-rest', 'rir'] as const;

    testConfigTypes.forEach((type) => {
        describe(`for type ${type}`, () => {
            test('calls editQuery.mutate with correct data when entry exists', async () => {

                const mockConfig = new BaseConfig(123, 10, 1, null, 5, '+', null, true, false);
                const user = userEvent.setup();

                render(
                    <QueryClientProvider client={testQueryClient}>
                        <ConfigDetailsField config={mockConfig} routineId={routineId} slotId={slotId} type={type} />
                    </QueryClientProvider>
                );

                await user.type(screen.getByTestId(`${type}-field`), '2');


                await new Promise((resolve) => setTimeout(resolve, DEBOUNCE_WAIT));

                expect(addMutation).toHaveBeenCalledTimes(0);
                expect(editMutation).toHaveBeenCalledTimes(1);
                expect(editMutation).toHaveBeenCalledWith({
                    id: mockConfig.id,
                    slot_config: slotId,
                    value: 52,
                    iteration: 1,
                    operation: null,
                    replace: true,
                    need_log_to_apply: false,
                });
                expect(deleteMutation).toHaveBeenCalledTimes(0);
            });

            test('calls addQuery.mutate with correct data when creating a new entry', async () => {
                const user = userEvent.setup();

                render(
                    <QueryClientProvider client={testQueryClient}>
                        <ConfigDetailsField routineId={routineId} slotId={slotId} type={type} />
                    </QueryClientProvider>
                );

                await user.type(screen.getByTestId(`${type}-field`), '8');
                await new Promise((resolve) => setTimeout(resolve, DEBOUNCE_WAIT));

                expect(addMutation).toHaveBeenCalledTimes(1);
                expect(addMutation).toHaveBeenCalledWith({
                    slot: slotId,
                    slot_config: 2,
                    value: 8,
                    iteration: 1,
                    operation: null,
                    replace: true,
                    need_log_to_apply: false,
                });
                expect(editMutation).toHaveBeenCalledTimes(0);
                expect(deleteMutation).toHaveBeenCalledTimes(0);
            });

            test('calls deleteQuery.mutate when value is deleted', async () => {
                const user = userEvent.setup();

                const mockConfig = new BaseConfig(123, 10, 1, null, 5, '+', null, true, false);
                render(
                    <QueryClientProvider client={testQueryClient}>
                        <ConfigDetailsField config={mockConfig} routineId={routineId} slotId={slotId} type={type} />
                    </QueryClientProvider>
                );

                await user.clear(screen.getByTestId(`${type}-field`));
                await new Promise((resolve) => setTimeout(resolve, DEBOUNCE_WAIT));

                expect(addMutation).toHaveBeenCalledTimes(0);
                expect(editMutation).toHaveBeenCalledTimes(0);
                expect(deleteMutation).toHaveBeenCalledTimes(1);
                expect(deleteMutation).toHaveBeenCalledWith(mockConfig.id);
            });
        });
    });
});