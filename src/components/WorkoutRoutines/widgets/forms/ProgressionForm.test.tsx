import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import { BaseConfig } from "components/WorkoutRoutines/models/BaseConfig";
import { ProgressionForm } from "components/WorkoutRoutines/widgets/forms/ProgressionForm";
import { processBaseConfigs } from "services";
import { testQueryClient } from "tests/queryClient";


jest.mock("services");
const mockProcessBaseConfigs = processBaseConfigs as jest.Mock;

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

    const testMaxConfigs = [
        new BaseConfig({
            id: 124,
            slotEntryId: 10,
            iteration: 1,
            value: 6,
        }),
        new BaseConfig({
            id: 457,
            slotEntryId: 10,
            iteration: 2,
            value: 2,
            operation: '+',
            repeat: true
        })
    ];

    beforeEach(() => {
        user = userEvent.setup();
        mockProcessBaseConfigs.mockClear();
    });

    function renderWidget() {
        render(
            <QueryClientProvider client={testQueryClient}>
                <ProgressionForm
                    configs={testConfigs}
                    configsMax={testMaxConfigs}
                    type={'weight'}
                    slotEntryId={10}
                    routineId={1}
                    iterations={[1, 2]}
                    cycleLength={7}
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

        screen.logTestingPlaygroundURL();

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

        // Once for weight, once for max-weight
        expect(mockProcessBaseConfigs).toHaveBeenCalledTimes(2);

        expect(mockProcessBaseConfigs).toHaveBeenNthCalledWith(1,
            [],
            [
                {
                    "id": 123,
                    "iteration": 1,
                    "need_log_to_apply": false,
                    "operation": "r",
                    "repeat": false,
                    "requirements": { "rules": [] },
                    "slot_entry": 10,
                    "step": "abs",
                    "value": "5"
                },
                {
                    "id": 456,
                    "iteration": 2,
                    "need_log_to_apply": false,
                    "operation": "+",
                    "repeat": true,
                    "requirements": { "rules": [] },
                    "slot_entry": 10,
                    "step": "abs",
                    "value": "1"
                }
            ],
            [],
            "weight-config"
        );
        expect(mockProcessBaseConfigs).toHaveBeenNthCalledWith(2,
            [],
            [
                {
                    "id": 124,
                    "iteration": 1,
                    "need_log_to_apply": false,
                    "operation": "r",
                    "repeat": false,
                    "requirements": { "rules": [] },
                    "slot_entry": 10,
                    "step": "abs",
                    "value": "7"
                },
                {
                    "id": 457,
                    "iteration": 2,
                    "need_log_to_apply": false,
                    "operation": "+",
                    "repeat": true,
                    "requirements": { "rules": [] },
                    "slot_entry": 10,
                    "step": "abs",
                    "value": "2"
                }
            ],
            [],
            "max-weight-config"
        );
    });
    
});