import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import { WeightForm } from "@/components/Weight/forms/WeightForm";
import { WeightEntry } from "@/components/Weight/models/WeightEntry";
import {
    useAddWeightEntryQuery,
    useBodyWeightCategoryQuery,
    useDisplayWeightUnit,
    useEditWeightEntryQuery
} from "@/components/Weight/queries";
import React from 'react';
import { testQueryClient } from "@/tests/queryClient";
import { testBodyWeightCategory } from "@/tests/weight/testData";
import type { Mock } from 'vitest';

vi.mock("@/components/Weight/queries");

const ENTRY_UUID = 'dddddddd-dddd-dddd-dddd-000000000001';

describe("Test WeightForm component", () => {

    beforeEach(() => {
        (useBodyWeightCategoryQuery as Mock).mockImplementation(() => ({
            isSuccess: true,
            isLoading: false,
            data: testBodyWeightCategory
        }));
        (useAddWeightEntryQuery as Mock).mockImplementation(() => ({ mutate: vi.fn() }));
        (useEditWeightEntryQuery as Mock).mockImplementation(() => ({ mutate: vi.fn() }));
        (useDisplayWeightUnit as Mock).mockReturnValue('kg');
    });


    test('Passing an existing entry renders its values in the form', () => {

        // Arrange
        const weightEntry = new WeightEntry(
            new Date('2021-12-10 17:00'),
            80,
            ENTRY_UUID,
        );

        // Act
        render(
            <QueryClientProvider client={testQueryClient}>
                <WeightForm weightEntry={weightEntry} />
            </QueryClientProvider>
        );

        // Assert
        expect(screen.getByDisplayValue('12/10/2021 05:00 PM')).toBeInTheDocument();
        expect(screen.getByDisplayValue('80')).toBeInTheDocument();
        expect(screen.getAllByLabelText('date').length).toBeGreaterThan(0);
        expect(screen.getByLabelText('weight')).toBeInTheDocument();
        expect(screen.getByText('submit')).toBeInTheDocument();
    });

    test('Editing an existing entry', async () => {

        // Arrange
        const user = userEvent.setup();
        const mutateEditMock = vi.fn();
        (useEditWeightEntryQuery as Mock).mockImplementation(() => ({ mutate: mutateEditMock }));
        const weightEntry = new WeightEntry(
            new Date('2022-02-28'),
            80,
            ENTRY_UUID
        );

        // Act
        render(
            <QueryClientProvider client={testQueryClient}>
                <WeightForm weightEntry={weightEntry} />
            </QueryClientProvider>
        );
        const weightInput = await screen.findByLabelText('weight');
        await user.clear(weightInput);
        await user.type(weightInput, '82');
        const submitButton = screen.getByRole('button', { name: 'submit' });
        fireEvent.click(submitButton);

        // Assert - the form submits a clone with the new values...
        await waitFor(() => {
            expect(mutateEditMock).toHaveBeenCalled();
        });
        const submitted = mutateEditMock.mock.calls[0][0] as WeightEntry;
        expect(submitted).not.toBe(weightEntry);
        expect(Number(submitted.weight)).toBe(82);
        expect(submitted.id).toBe(ENTRY_UUID);

        // ...and does not mutate the passed-in entry (it comes from the query cache)
        expect(weightEntry.weight).toBe(80);
    });

    test('Creating a new weight entry', async () => {

        // Arrange
        const user = userEvent.setup();
        render(
            <QueryClientProvider client={testQueryClient}>
                <WeightForm />
            </QueryClientProvider>
        );

        const group = screen.getByRole('group', { name: /date/i });
        const dateInput = within(group).getByRole('textbox', { hidden: true });
        const weightInput = await screen.findByLabelText('weight');
        const submitButton = screen.getByRole('button', { name: 'submit' });

        // Act
        user.type(dateInput, '2022-02-28');
        user.type(weightInput, '80');

        // Assert
        expect(dateInput).toBeInTheDocument();
        expect(weightInput).toBeInTheDocument();
        expect(submitButton).toBeInTheDocument();
        await user.click(submitButton);
        await waitFor(() => {
            expect(useAddWeightEntryQuery).toHaveBeenCalled();
        });
    });

    test('The weight field error state follows validity, not just touched', async () => {

        // Arrange
        const user = userEvent.setup();
        render(
            <QueryClientProvider client={testQueryClient}>
                <WeightForm weightEntry={new WeightEntry(new Date('2022-02-28'), 80, ENTRY_UUID)} />
            </QueryClientProvider>
        );
        const weightInput = await screen.findByLabelText('weight');

        // Act + Assert: an invalid value marks the touched field as error
        await user.clear(weightInput);
        await user.type(weightInput, '10'); // below the min of 30 kg
        await user.tab();
        await waitFor(() => expect(weightInput).toHaveAttribute('aria-invalid', 'true'));

        // Act + Assert: correcting it to a valid value must clear the error state
        await user.clear(weightInput);
        await user.type(weightInput, '80');
        await waitFor(() => expect(weightInput).not.toHaveAttribute('aria-invalid', 'true'));
    });

});
