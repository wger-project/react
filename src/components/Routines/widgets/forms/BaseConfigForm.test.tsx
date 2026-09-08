import { BaseConfig, OPERATION_REPLACE } from '@/components/Routines/models/BaseConfig';

import {
    ConfigDetailsRequirementsField,
    SlotBaseConfigValueField
} from '@/components/Routines/widgets/forms/BaseConfigForm';
import { testQueryClient } from "@/tests/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import React from 'react';


vi.mock('@/core/lib/consts', () => {
    return {
        DEBOUNCE_ROUTINE_FORMS: '5'
    };
});


vi.mock('@/components/Routines/queries', () => ({
    useEditWeightConfigQuery: vi.fn(() => ({ mutate: editMutation })),
    useAddWeightConfigQuery: vi.fn(() => ({ mutate: addMutation })),
    useDeleteWeightConfigQuery: vi.fn(() => ({ mutate: deleteMutation })),
    useEditMaxWeightConfigQuery: vi.fn(() => ({ mutate: editMutation })),
    useAddMaxWeightConfigQuery: vi.fn(() => ({ mutate: addMutation })),
    useDeleteMaxWeightConfigQuery: vi.fn(() => ({ mutate: deleteMutation })),
    useEditRepsConfigQuery: vi.fn(() => ({ mutate: editMutation })),
    useAddRepsConfigQuery: vi.fn(() => ({ mutate: addMutation })),
    useDeleteRepsConfigQuery: vi.fn(() => ({ mutate: deleteMutation })),
    useEditMaxRepsConfigQuery: vi.fn(() => ({ mutate: editMutation })),
    useAddMaxRepsConfigQuery: vi.fn(() => ({ mutate: addMutation })),
    useDeleteMaxRepsConfigQuery: vi.fn(() => ({ mutate: deleteMutation })),
    useEditNrOfSetsConfigQuery: vi.fn(() => ({ mutate: editMutation })),
    useAddNrOfSetsConfigQuery: vi.fn(() => ({ mutate: addMutation })),
    useDeleteNrOfSetsConfigQuery: vi.fn(() => ({ mutate: deleteMutation })),
    useEditMaxNrOfSetsConfigQuery: vi.fn(() => ({ mutate: editMutation })),
    useAddMaxNrOfSetsConfigQuery: vi.fn(() => ({ mutate: addMutation })),
    useDeleteMaxNrOfSetsConfigQuery: vi.fn(() => ({ mutate: deleteMutation })),
    useEditRestConfigQuery: vi.fn(() => ({ mutate: editMutation })),
    useAddRestConfigQuery: vi.fn(() => ({ mutate: addMutation })),
    useDeleteRestConfigQuery: vi.fn(() => ({ mutate: deleteMutation })),
    useEditMaxRestConfigQuery: vi.fn(() => ({ mutate: editMutation })),
    useAddMaxRestConfigQuery: vi.fn(() => ({ mutate: addMutation })),
    useDeleteMaxRestConfigQuery: vi.fn(() => ({ mutate: deleteMutation })),
    useEditRiRConfigQuery: vi.fn(() => ({ mutate: editMutation })),
    useAddRiRConfigQuery: vi.fn(() => ({ mutate: addMutation })),
    useDeleteRiRConfigQuery: vi.fn(() => ({ mutate: deleteMutation })),
    useEditMaxRiRConfigQuery: vi.fn(() => ({ mutate: editMutation })),
    useAddMaxRiRConfigQuery: vi.fn(() => ({ mutate: addMutation })),
    useDeleteMaxRiRConfigQuery: vi.fn(() => ({ mutate: deleteMutation })),
}));


const editMutation = vi.fn();
const addMutation = vi.fn();
const deleteMutation = vi.fn();

describe('EntryDetailsField Component', () => {
    const routineId = 1;
    const slotEntryId = 2;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    const testConfigTypes = ['weight', 'max-weight', 'reps', 'max-reps', 'sets', 'rest', 'max-rest', 'rir'] as const;

    testConfigTypes.forEach((type) => {
        describe(`for type ${type}`, () => {
            test('calls editQuery.mutate with correct data when entry exists', async () => {

                const mockConfig = new BaseConfig({
                    id: 123,
                    slotEntryId: 10,
                    iteration: 1,
                    value: 5,
                    operation: '+',
                    step: 'abs',
                    repeat: false,
                    requirements: null,
                });
                const user = userEvent.setup();

                render(
                    <QueryClientProvider client={testQueryClient}>
                        <SlotBaseConfigValueField config={mockConfig} routineId={routineId} slotEntryId={slotEntryId}
                                                  type={type} />
                    </QueryClientProvider>
                );

                await user.type(screen.getByTestId(`${type}-field`), '2');

                await waitFor(() => expect(editMutation).toHaveBeenCalledTimes(1));
                expect(addMutation).toHaveBeenCalledTimes(0);
                expect(editMutation).toHaveBeenCalledWith({
                    id: mockConfig.id,

                    slot_entry: slotEntryId,
                    value: 52,
                });
                expect(deleteMutation).toHaveBeenCalledTimes(0);
            });

            test('calls addQuery.mutate with correct data when creating a new entry', async () => {
                const user = userEvent.setup();

                render(
                    <QueryClientProvider client={testQueryClient}>
                        <SlotBaseConfigValueField routineId={routineId} slotEntryId={slotEntryId} type={type} />
                    </QueryClientProvider>
                );

                await user.type(screen.getByTestId(`${type}-field`), '8');

                await waitFor(() => expect(addMutation).toHaveBeenCalledTimes(1));
                expect(addMutation).toHaveBeenCalledWith({

                    slot_entry: 2,
                    value: 8,
                    iteration: 1,
                    operation: OPERATION_REPLACE,
                    step: 'abs',
                    requirements: null,
                });
                expect(editMutation).toHaveBeenCalledTimes(0);
                expect(deleteMutation).toHaveBeenCalledTimes(0);
            });

            test('calls deleteQuery.mutate when value is deleted', async () => {
                const user = userEvent.setup();

                const mockConfig = new BaseConfig({
                    id: 123,
                    slotEntryId: 10,
                    iteration: 1,
                    value: 5,
                    operation: '+',
                    step: 'abs',
                    repeat: false,
                    requirements: null,
                });
                render(
                    <QueryClientProvider client={testQueryClient}>
                        <SlotBaseConfigValueField config={mockConfig} routineId={routineId} slotEntryId={slotEntryId}
                                                  type={type} />
                    </QueryClientProvider>
                );

                await user.clear(screen.getByTestId(`${type}-field`));

                await waitFor(() => expect(deleteMutation).toHaveBeenCalledTimes(1));
                expect(addMutation).toHaveBeenCalledTimes(0);
                expect(editMutation).toHaveBeenCalledTimes(0);
                expect(deleteMutation).toHaveBeenCalledWith(mockConfig.id);
            });
        });
    });
});

describe('ConfigDetailsRequirementsField', () => {
    const onChange = vi.fn();

    beforeEach(() => {
        onChange.mockClear();
    });

    test('drops the all sets flag once the last rule is removed', async () => {
        const user = userEvent.setup();
        render(<ConfigDetailsRequirementsField values={['repetitions']} allSets={true} onChange={onChange} />);
        await user.click(screen.getByRole('button'));

        await user.click(screen.getByRole('menuitem', { name: /requirementRules\.repetitions/ }));
        // Nothing selected any more, so all sets has nothing to apply to
        expect(screen.getByRole('menuitem', { name: /requirementsAllSets/ })).toHaveAttribute('aria-disabled', 'true');

        await user.click(within(screen.getByRole('menu')).getByRole('button', { name: /save/i }));
        expect(onChange).toHaveBeenCalledExactlyOnceWith([], false);
    });

    test('reopens with the values of the parent, not with its last selection', async () => {
        const user = userEvent.setup();
        const { rerender } = render(
            <ConfigDetailsRequirementsField values={[]} allSets={false} onChange={onChange} />
        );
        await user.click(screen.getByRole('button'));
        await user.click(screen.getByRole('menuitem', { name: /requirementRules\.max_repetitions/ }));
        await user.click(screen.getByRole('menuitem', { name: /requirementsAllSets/ }));
        await user.click(within(screen.getByRole('menu')).getByRole('button', { name: /save/i }));
        expect(onChange).toHaveBeenCalledExactlyOnceWith(['max_repetitions'], true);
        await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());

        // The parent reset the requirements, e.g. by switching the operation to replace
        rerender(<ConfigDetailsRequirementsField values={[]} allSets={false} onChange={onChange} />);
        await user.click(screen.getByRole('button'));

        const ruleItem = screen.getByRole('menuitem', { name: /requirementRules\.max_repetitions/ });
        expect(within(ruleItem).queryByTestId('CheckBoxIcon')).not.toBeInTheDocument();
        expect(screen.getByRole('menuitem', { name: /requirementsAllSets/ })).toHaveAttribute('aria-disabled', 'true');
    });
});