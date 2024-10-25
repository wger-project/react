import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { WeightForm } from "components/BodyWeight/Form/WeightForm";
import { WeightEntry } from "components/BodyWeight/model";
import { useAddWeightEntryQuery, useBodyWeightQuery, useEditWeightEntryQuery } from "components/BodyWeight/queries";
import React from 'react';
import { testQueryClient } from "tests/queryClient";
import { testWeightEntries } from "tests/weight/testData";

jest.mock("services");
jest.mock("components/BodyWeight/queries");


describe("Test WeightForm component", () => {

    beforeEach(() => {
        // @ts-ignore
        useBodyWeightQuery.mockImplementation(() => ({ isSuccess: true, data: testWeightEntries }));
    });


    test('Passing an existing entry renders its values in the form', () => {

        // Arrange
        const weightEntry: WeightEntry = {
            id: 1,
            date: new Date('2021-12-10'),
            weight: 80
        };

        // Act
        render(
            <QueryClientProvider client={testQueryClient}>
                <WeightForm weightEntry={weightEntry} />
            </QueryClientProvider>
        );

        // Assert
        expect(screen.getByDisplayValue('2021-12-10')).toBeInTheDocument();
        expect(screen.getByDisplayValue('80')).toBeInTheDocument();
        expect(screen.getByLabelText('date')).toBeInTheDocument();
        expect(screen.getByLabelText('weight')).toBeInTheDocument();
        expect(screen.getByText('submit')).toBeInTheDocument();
    });

    test('Editing an existing entry', async () => {

        // Arrange
        const weightEntry: WeightEntry = {
            id: 1,
            date: new Date('2022-02-28'),
            weight: 80
        };

        // Act
        render(
            <QueryClientProvider client={testQueryClient}>
                <WeightForm weightEntry={weightEntry} />
            </QueryClientProvider>
        );
        const submitButton = screen.getByRole('button', { name: 'submit' });

        // Assert
        expect(submitButton).toBeInTheDocument();
        fireEvent.click(submitButton);
        await waitFor(() => {
            expect(useEditWeightEntryQuery).toHaveBeenCalled();
        });
    });

    test('Creating a new weight entry', async () => {

        // Arrange
        render(
            <QueryClientProvider client={testQueryClient}>
                <WeightForm />
            </QueryClientProvider>
        );
        const dateInput = await screen.findByLabelText('date');
        const weightInput = await screen.findByLabelText('weight');
        const submitButton = screen.getByRole('button', { name: 'submit' });

        // Act
        fireEvent.input(dateInput, { target: { value: '2022-02-28' } });
        fireEvent.input(weightInput, { target: { value: '80' } });

        // Assert
        expect(dateInput).toBeInTheDocument();
        expect(weightInput).toBeInTheDocument();
        expect(submitButton).toBeInTheDocument();
        fireEvent.click(submitButton);
        await waitFor(() => {
            expect(useAddWeightEntryQuery).toHaveBeenCalled();
        });
    });

});
