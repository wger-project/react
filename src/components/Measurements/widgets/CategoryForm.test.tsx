import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import { useAddMeasurementCategoryQuery, useEditMeasurementCategoryQuery } from "components/Measurements/queries";
import { CategoryForm } from "components/Measurements/widgets/CategoryForm";
import React from 'react';
import { TEST_MEASUREMENT_CATEGORY_1, TEST_MEASUREMENT_CATEGORY_2 } from "tests/measurementsTestData";

jest.mock("services/weight");

jest.mock("components/Measurements/queries");


describe("Test the CategoryForm component", () => {
    const queryClient = new QueryClient();
    let mutate = jest.fn();

    beforeEach(() => {
        mutate = jest.fn();

        (useEditMeasurementCategoryQuery as jest.Mock).mockImplementation(() => ({
            mutate: mutate
        }));
        (useAddMeasurementCategoryQuery as jest.Mock).mockImplementation(() => ({
            mutate: mutate
        }));
    });

    test('Passing an existing entry renders its values in the form', () => {

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <CategoryForm category={TEST_MEASUREMENT_CATEGORY_1} />
            </QueryClientProvider>
        );

        // Assert
        expect(screen.getByDisplayValue('Biceps')).toBeInTheDocument();
        expect(screen.getByDisplayValue('cm')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'submit' })).toBeInTheDocument();
    });

    test('Editing an existing category', async () => {

        // Arrange
        const user = userEvent.setup();

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <CategoryForm category={TEST_MEASUREMENT_CATEGORY_2} />
            </QueryClientProvider>
        );
        const submitButton = screen.getByRole('button', { name: 'submit' });
        const nameInput = await screen.findByLabelText('name');
        const unitInput = await screen.findByLabelText('unit');

        await user.clear(nameInput);
        await user.type(nameInput, 'a better name');
        await user.clear(unitInput);
        await user.type(unitInput, 'K/m2');

        // Assert
        await user.click(submitButton);
        expect(mutate).toHaveBeenCalledWith({
            id: 2,
            name: "a better name",
            unit: 'K/m2',
        });
    });

    test('Creating a new category', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <CategoryForm />
            </QueryClientProvider>
        );
        const nameInput = await screen.findByLabelText('name');
        const unitInput = await screen.findByLabelText('unit');
        const submitButton = screen.getByRole('button', { name: 'submit' });
        await user.type(nameInput, 'calves');
        await user.type(unitInput, 'cm');

        // Assert
        await user.click(submitButton);
        expect(mutate).toHaveBeenCalledWith({
            name: 'calves',
            unit: 'cm'
        });
    });
});
