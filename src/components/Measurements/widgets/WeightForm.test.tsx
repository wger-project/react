import { MeasurementEntry } from "@/components/Measurements";
import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import { useProfileQuery } from "@/components/User";
import { WeightForm } from "@/components/Measurements/widgets/WeightForm";
import { useAddMeasurementEntryQuery, useEditMeasurementEntryQuery } from "@/components/Measurements/queries";
import { useBodyWeightCategoryQuery, useDisplayWeightUnit } from "@/components/Measurements/queries/bodyWeight";
import React from 'react';
import { testQueryClient } from "@/tests/queryClient";
import { testBodyWeightCategory, makeWeightEntry } from "@/tests/weight/testData";
import type { Mock } from 'vitest';

vi.mock("@/components/Measurements/queries/bodyWeight");
vi.mock("@/components/Measurements/queries");
vi.mock("@/components/User/queries/profile");

const ENTRY_UUID = 'dddddddd-dddd-dddd-dddd-000000000001';

describe("Test WeightForm component", () => {

    beforeEach(() => {
        (useBodyWeightCategoryQuery as Mock).mockImplementation(() => ({
            isSuccess: true,
            isLoading: false,
            data: testBodyWeightCategory
        }));
        (useAddMeasurementEntryQuery as Mock).mockImplementation(() => ({ mutate: vi.fn() }));
        (useEditMeasurementEntryQuery as Mock).mockImplementation(() => ({ mutate: vi.fn() }));
        (useDisplayWeightUnit as Mock).mockReturnValue('kg');
        (useProfileQuery as Mock).mockImplementation(() => ({ isLoading: false }));
    });

    test('waits for the profile before rendering, the unit default depends on it', () => {

        // Arrange
        (useProfileQuery as Mock).mockImplementation(() => ({ isLoading: true }));

        // Act
        render(
            <QueryClientProvider client={testQueryClient}>
                <WeightForm />
            </QueryClientProvider>
        );

        // Assert
        expect(screen.queryByLabelText('weight')).not.toBeInTheDocument();
    });


    test('Passing an existing entry renders its values in the form', () => {

        // Arrange
        const weightEntry = makeWeightEntry(new Date('2021-12-10 17:00'), 80, { id: ENTRY_UUID });

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
        (useEditMeasurementEntryQuery as Mock).mockImplementation(() => ({ mutate: mutateEditMock }));
        const weightEntry = makeWeightEntry(new Date('2022-02-28'), 80, { id: ENTRY_UUID });

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
        const submitted = mutateEditMock.mock.calls[0][0] as MeasurementEntry;
        expect(submitted).not.toBe(weightEntry);
        expect(Number(submitted.value)).toBe(82);
        expect(submitted.id).toBe(ENTRY_UUID);

        // ...and does not mutate the passed-in entry (it comes from the query cache)
        expect(weightEntry.value).toBe(80);
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
            expect(useAddMeasurementEntryQuery).toHaveBeenCalled();
        });
    });

    test('The weight field error state follows validity, not just touched', async () => {

        // Arrange
        const user = userEvent.setup();
        render(
            <QueryClientProvider client={testQueryClient}>
                <WeightForm weightEntry={makeWeightEntry(new Date('2022-02-28'), 80, { id: ENTRY_UUID })} />
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

    test('The validation limits follow the selected unit', async () => {

        // Arrange
        const user = userEvent.setup();
        const mutateAddMock = vi.fn();
        (useAddMeasurementEntryQuery as Mock).mockImplementation(() => ({ mutate: mutateAddMock }));
        render(
            <QueryClientProvider client={testQueryClient}>
                <WeightForm />
            </QueryClientProvider>
        );
        const weightInput = await screen.findByLabelText('weight');

        // Act + Assert: 400 is over the kg maximum...
        await user.clear(weightInput);
        await user.type(weightInput, '400');
        await user.tab();
        await waitFor(() => expect(weightInput).toHaveAttribute('aria-invalid', 'true'));

        // ...but a perfectly fine weight in lb
        await user.click(screen.getByRole('button', { name: 'server.lb' }));
        await waitFor(() => expect(weightInput).not.toHaveAttribute('aria-invalid', 'true'));

        // ...and can be submitted with the lb unit stamped
        await user.click(screen.getByRole('button', { name: 'submit' }));
        await waitFor(() => expect(mutateAddMock).toHaveBeenCalled());
        const submitted = mutateAddMock.mock.calls[0][0] as MeasurementEntry;
        expect(submitted.extraData.unit).toBe('lb');
        expect(Number(submitted.value)).toBe(400);

        // Act + Assert: 35 lb is below the lb minimum
        await user.clear(weightInput);
        await user.type(weightInput, '35');
        await user.tab();
        await waitFor(() => expect(weightInput).toHaveAttribute('aria-invalid', 'true'));
    });

});
