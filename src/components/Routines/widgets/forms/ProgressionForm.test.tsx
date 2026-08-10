import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import { BaseConfig } from "@/components/Routines/models/BaseConfig";
import { ProgressionForm } from "@/components/Routines/widgets/forms/ProgressionForm";
import { processBaseConfigs } from "@/components/Routines/api/baseConfig";
import { testQueryClient } from "@/tests/queryClient";
import type { Mock } from 'vitest';


vi.mock("@/components/Routines/api/baseConfig");
const mockProcessBaseConfigs = processBaseConfigs as Mock;

describe('Tests for the ProgressionForm', () => {

    let user: ReturnType<typeof userEvent.setup>;

    const testConfigs = [
        new BaseConfig({
            id: 123,
            slotEntryId: 10,
            iteration: 1,
            value: 5,
        }),
        new BaseConfig({
            id: 456,
            slotEntryId: 10,
            iteration: 2,
            value: 1,
            operation: '+',
            repeat: true
        })
    ];

    // The max configs deliberately differ from the min ones in operation, step and
    // repeat: the form only renders one set of those controls, so the max values
    // follow the min ones and the payload below pins exactly that.
    const testMaxConfigs = [
        new BaseConfig({
            id: 124,
            slotEntryId: 10,
            iteration: 1,
            value: 6,
            step: 'percent',
        }),
        new BaseConfig({
            id: 457,
            slotEntryId: 10,
            iteration: 2,
            value: 2,
            operation: '-',
            step: 'percent',
            repeat: false
        })
    ];

    beforeEach(() => {
        user = userEvent.setup();
        mockProcessBaseConfigs.mockClear();
    });

    function renderWidget(iterations: number[] = [1, 2]) {
        render(
            <QueryClientProvider client={testQueryClient}>
                <ProgressionForm
                    configs={testConfigs}
                    configsMax={testMaxConfigs}
                    type={'weight'}
                    slotEntryId={10}
                    routineId={1}
                    iterations={iterations}
                    isWeeklyCycle={true}
                />
            </QueryClientProvider>
        );
    }


    test('smoke test - just render the form', async () => {

        // Act
        renderWidget();

        // Assert
        expect(screen.getByText('value')).toBeInTheDocument();
        expect(screen.queryAllByText('routines.operation')).toHaveLength(3);
        expect(screen.queryAllByText('routines.step')).toHaveLength(3);
        expect(screen.getByText('routines.requirements')).toBeInTheDocument();
        expect(screen.getByText('routines.repeat')).toBeInTheDocument();
        expect(screen.queryAllByText('routines.weekNr')).toHaveLength(2);

        const minFields = screen.getAllByLabelText('min');
        expect(minFields[0]).toHaveValue('5');
        expect(minFields[1]).toHaveValue('1');

        const maxFields = screen.getAllByLabelText('max');
        expect(maxFields[0]).toHaveValue('6');
        expect(maxFields[1]).toHaveValue('2');

    });

    test('test that the save button is disabled till a value is changed', async () => {
        // Act
        renderWidget();

        // Assert
        const saveButton = screen.getByRole('button', { name: /save/i });
        expect(saveButton).toBeDisabled();

        const valueField = screen.getAllByLabelText('max')[0];
        await user.clear(valueField);
        await user.type(valueField, '14');
        expect(saveButton).toBeEnabled();
    });

    test('test that the correct data is sent to the server - editing', async () => {
        // Act
        renderWidget();

        // Assert
        const saveButton = screen.getByRole('button', { name: /save/i });

        const valueField = screen.getAllByLabelText('max')[0];
        await user.clear(valueField);
        await user.type(valueField, '7');
        await user.click(saveButton);

        expect(mockProcessBaseConfigs).toHaveBeenCalledTimes(1);
        expect(mockProcessBaseConfigs).toHaveBeenNthCalledWith(1,
            {
                "maxValues": {
                    "apiPath": "max-weight-config",
                    "toAdd": [],
                    "toDelete": [],
                    "toEdit": [{
                        "id": 124,
                        "iteration": 1,
                        "operation": "r",
                        "repeat": false,
                        "requirements": { "rules": [] },
                        "slot_entry": 10,
                        "step": "abs",
                        "value": "7"
                    }, {
                        "id": 457,
                        "iteration": 2,
                        "operation": "+",
                        "repeat": true,
                        "requirements": { "rules": [] },
                        "slot_entry": 10,
                        "step": "abs",
                        "value": "2"
                    }]
                },
                "values": {
                    "apiPath": "weight-config",
                    "toAdd": [],
                    "toDelete": [],
                    "toEdit": [{
                        "id": 123,
                        "iteration": 1,
                        "operation": "r",
                        "repeat": false,
                        "requirements": { "rules": [] },
                        "slot_entry": 10,
                        "step": "abs",
                        "value": "5"
                    }, {
                        "id": 456,
                        "iteration": 2,
                        "operation": "+",
                        "repeat": true,
                        "requirements": { "rules": [] },
                        "slot_entry": 10,
                        "step": "abs",
                        "value": "1"
                    }]
                }
            }
        );
    });

    test('adds a config for an iteration that has none yet', async () => {

        // Act
        // The third week has no config, its row only offers to add one
        renderWidget([1, 2, 3]);
        const addButtons = screen.getAllByTestId('AddIcon');
        await user.click(addButtons[0].closest('button')!);

        const minFields = screen.getAllByLabelText('min');
        await user.type(minFields[2], '9');
        await user.click(screen.getByRole('button', { name: /save/i }));

        // Assert
        const [payload] = mockProcessBaseConfigs.mock.calls[0];
        expect(payload.values.toAdd).toEqual([{
            "iteration": 3,
            "operation": "r",
            "repeat": false,
            "requirements": { "rules": [] },
            "slot_entry": 10,
            "step": "abs",
            "value": "9"
        }]);
        // The new entry has no id yet, so it must not show up in the edit list
        expect(payload.values.toEdit.map((entry: { id: number }) => entry.id)).toEqual([123, 456]);
    });

    test('deletes the config of an iteration', async () => {

        // Act
        renderWidget();
        // The first row cannot be deleted while later ones exist
        const deleteButtons = screen.getAllByTestId('DeleteIcon');
        await user.click(deleteButtons[1].closest('button')!);
        await user.click(screen.getByRole('button', { name: /save/i }));

        // Assert
        const [payload] = mockProcessBaseConfigs.mock.calls[0];
        expect(payload.values.toDelete).toEqual([456]);
        expect(payload.maxValues.toDelete).toEqual([457]);
        expect(payload.values.toAdd).toEqual([]);
    });

    test('clearing a value deletes that config as well', async () => {

        // Act
        renderWidget();
        const minFields = screen.getAllByLabelText('min');
        await user.clear(minFields[1]);
        await user.click(screen.getByRole('button', { name: /save/i }));

        // Assert
        const [payload] = mockProcessBaseConfigs.mock.calls[0];
        expect(payload.values.toDelete).toContain(456);
    });

    test('the first entry can only be deleted when it is the only one', async () => {

        // Act
        renderWidget();

        // Assert
        const deleteButtons = screen.getAllByTestId('DeleteIcon');
        expect(deleteButtons[0].closest('button')).toBeDisabled();
        expect(deleteButtons[1].closest('button')).toBeEnabled();
    });

    test('the max value may not be smaller than the min value', async () => {

        // Act
        renderWidget();
        const maxFields = screen.getAllByLabelText('max');
        await user.clear(maxFields[0]);
        await user.type(maxFields[0], '2'); // the min value of that row is 5
        await user.tab();

        // Assert
        expect(await screen.findByText('forms.maxLessThanMin')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
        expect(mockProcessBaseConfigs).not.toHaveBeenCalled();
    });
});