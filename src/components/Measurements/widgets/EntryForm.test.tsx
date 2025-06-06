import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import {
    useAddMeasurementEntryQuery,
    useEditMeasurementEntryQuery,
    useMeasurementsQuery
} from "components/Measurements/queries";
import { EntryForm } from "components/Measurements/widgets/EntryForm";
import { TEST_MEASUREMENT_CATEGORY_1, TEST_MEASUREMENT_ENTRIES_1 } from "tests/measurementsTestData";

jest.mock("services/weight");

jest.mock("components/Measurements/queries");


describe("Test the EntryForm component", () => {
    const queryClient = new QueryClient();
    let mutate = jest.fn();

    beforeEach(() => {
        (useMeasurementsQuery as jest.Mock).mockImplementation(() => ({
            isSuccess: true,
            isLoading: false,
            data: TEST_MEASUREMENT_CATEGORY_1
        }));

        mutate = jest.fn();

        (useEditMeasurementEntryQuery as jest.Mock).mockImplementation(() => ({
            mutate: mutate
        }));
        (useAddMeasurementEntryQuery as jest.Mock).mockImplementation(() => ({
            mutate: mutate
        }));
    });

    test('Passing an existing entry renders its values in the form', () => {

        // Arrange
        const entry = TEST_MEASUREMENT_ENTRIES_1[0];

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <EntryForm entry={entry} categoryId={1} />
            </QueryClientProvider>
        );

        // Assert
        expect(screen.getByDisplayValue('2023-02-01')).toBeInTheDocument();
        expect(screen.getByDisplayValue('10')).toBeInTheDocument();
        expect(screen.getByDisplayValue('test note')).toBeInTheDocument();
        expect(screen.getAllByLabelText('date').length).toBeGreaterThan(0);
        expect(screen.getByLabelText('value')).toBeInTheDocument();
        expect(screen.getByLabelText('notes')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'submit' })).toBeInTheDocument();
    });

    test('Editing an existing entry', async () => {

        // Arrange
        const entry = TEST_MEASUREMENT_ENTRIES_1[0];
        const user = userEvent.setup();

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <EntryForm entry={entry} categoryId={1} />
            </QueryClientProvider>
        );
        const submitButton = screen.getByRole('button', { name: 'submit' });
        await user.clear(screen.getByLabelText('value'));
        await user.type(screen.getByLabelText('value'), '25');

        // Assert
        expect(submitButton).toBeInTheDocument();
        await user.click(submitButton);
        expect(mutate).toHaveBeenCalledWith({
            date: expect.anything(), // timezones... new Date("2023-01-31T23:00:00.000Z"),
            id: 1,
            notes: "test note",
            value: 25,
        });
    });

    test('Creating a new entry', async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <EntryForm categoryId={11} />
            </QueryClientProvider>
        );
        const group = screen.getByRole('group', { name: /date/i });
        const dateInput = within(group).getByRole('textbox', { hidden: true });
        const valueInput = await screen.findByLabelText('value');
        const notesInput = await screen.findByLabelText('notes');
        const submitButton = screen.getByRole('button', { name: 'submit' });

        // Act
        await user.type(dateInput, '2023-06-18');
        await user.clear(valueInput);
        await user.type(valueInput, '42.42');
        await user.clear(notesInput);
        await user.type(notesInput, 'The Shiba Inu is a breed of hunting dog from Japan.');

        // Assert
        expect(submitButton).toBeInTheDocument();
        await user.click(submitButton);
        expect(mutate).toHaveBeenCalledWith({
            categoryId: 11,
            date: expect.anything(), // timezones... new Date('2023-06-17T22:00:00.000Z')
            notes: 'The Shiba Inu is a breed of hunting dog from Japan.',
            value: 42.42,
        });
    });
});
