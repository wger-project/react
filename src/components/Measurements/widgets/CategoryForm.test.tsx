import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import {
    useAddMeasurementCategoryQuery,
    useEditMeasurementCategoryQuery,
    useMeasurementsCategoryQuery
} from "@/components/Measurements/queries";
import { MeasurementCategory } from "@/components/Measurements/models/Category";
import { CategoryForm } from "@/components/Measurements/widgets/CategoryForm";
import React from 'react';
import { TEST_MEASUREMENT_CATEGORY_1, TEST_MEASUREMENT_CATEGORY_2 } from "@/tests/measurementsTestData";
import type { Mock } from 'vitest';

vi.mock("@/components/Weight/api/weight");

vi.mock("@/components/Measurements/queries");

// an entry-free category, eligible as a group parent
const TEST_GROUP_CATEGORY = new MeasurementCategory(
    'cccccccc-cccc-cccc-cccc-000000000042',
    'Blood pressure',
    'mmHg',
);

describe("Test the CategoryForm component", () => {
    const queryClient = new QueryClient();
    let mutate = vi.fn();

    beforeEach(() => {
        mutate = vi.fn();

        (useEditMeasurementCategoryQuery as Mock).mockImplementation(() => ({
            mutate: mutate
        }));
        (useAddMeasurementCategoryQuery as Mock).mockImplementation(() => ({
            mutate: mutate
        }));
        (useMeasurementsCategoryQuery as Mock).mockImplementation(() => ({
            data: [TEST_MEASUREMENT_CATEGORY_1, TEST_MEASUREMENT_CATEGORY_2, TEST_GROUP_CATEGORY]
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
        expect(mutate).toHaveBeenCalledWith(MeasurementCategory.clone(
            TEST_MEASUREMENT_CATEGORY_2,
            { name: "a better name", unit: 'K/m2' }
        ));
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
        expect(mutate).toHaveBeenCalledWith(new MeasurementCategory(null, 'calves', 'cm'));
    });

    test('The body weight metric type is not offered', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <CategoryForm />
            </QueryClientProvider>
        );
        await user.click(screen.getByRole('combobox', { name: 'measurements.metricType' }));

        // Assert
        expect(screen.getByRole('option', { name: 'measurements.metricTypes.steps' })).toBeInTheDocument();
        expect(screen.queryByRole('option', { name: 'measurements.metricTypes.body_weight' })).toBeNull();
    });

    test('Creating a category with a metric type and group', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <CategoryForm />
            </QueryClientProvider>
        );
        await user.type(await screen.findByLabelText('name'), 'Systolic');
        await user.type(await screen.findByLabelText('unit'), 'mmHg');

        await user.click(screen.getByRole('combobox', { name: 'measurements.metricType' }));
        await user.click(screen.getByRole('option', { name: 'measurements.metricTypes.blood_pressure' }));

        await user.click(screen.getByRole('combobox', { name: 'measurements.partOfGroup' }));
        await user.click(screen.getByRole('option', { name: 'Blood pressure' }));

        await user.click(screen.getByRole('button', { name: 'submit' }));

        // Assert
        expect(mutate).toHaveBeenCalledWith(new MeasurementCategory(
            null,
            'Systolic',
            'mmHg',
            undefined,
            'blood_pressure',
            false,
            TEST_GROUP_CATEGORY.id,
        ));
    });

    test('Only entry-free top-level categories are offered as parents', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <CategoryForm />
            </QueryClientProvider>
        );
        await user.click(screen.getByRole('combobox', { name: 'measurements.partOfGroup' }));

        // Assert - the categories with entries are not eligible
        expect(screen.getByRole('option', { name: 'Blood pressure' })).toBeInTheDocument();
        expect(screen.queryByRole('option', { name: 'Biceps' })).toBeNull();
        expect(screen.queryByRole('option', { name: 'Body fat' })).toBeNull();
    });

    test('The group dropdown is hidden for a category with children', () => {
        // Arrange
        const child = new MeasurementCategory(
            'cccccccc-cccc-cccc-cccc-000000000043',
            'Systolic',
            'mmHg',
            undefined,
            'blood_pressure',
            false,
            TEST_GROUP_CATEGORY.id,
        );
        (useMeasurementsCategoryQuery as Mock).mockImplementation(() => ({
            data: [TEST_GROUP_CATEGORY, child]
        }));

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <CategoryForm category={TEST_GROUP_CATEGORY} />
            </QueryClientProvider>
        );

        // Assert
        expect(screen.queryByRole('combobox', { name: 'measurements.partOfGroup' })).toBeNull();
    });
});
