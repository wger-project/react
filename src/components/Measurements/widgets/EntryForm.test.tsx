import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import { MeasurementEntry } from "components/Measurements/models/Entry";
import {
    useAddMeasurementEntryQuery,
    useEditMeasurementEntryQuery,
    useMeasurementsQuery
} from "components/Measurements/queries";
import { EntryForm } from "components/Measurements/widgets/EntryForm";
import i18n from "i18next";
import { TEST_MEASUREMENT_CATEGORY_1, TEST_MEASUREMENT_ENTRIES_1 } from "tests/measurementsTestData";

jest.mock("services/weight");

jest.mock("components/Measurements/queries");


describe("Test the EntryForm component", () => {
    const queryClient = new QueryClient();
    let mutate = jest.fn();

    const renderComponent = (props: { entry?: MeasurementEntry, categoryId: number }) => {
        return render(
            <QueryClientProvider client={queryClient}>
                <EntryForm {...props} />
            </QueryClientProvider>
        );
    };

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
        renderComponent({ entry, categoryId: 1 });

        // Assert
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
        renderComponent({ entry, categoryId: 1 });
        const submitButton = screen.getByRole('button', { name: 'submit' });
        await user.clear(screen.getByLabelText('value'));
        await user.type(screen.getByLabelText('value'), '25');

        // Assert
        expect(submitButton).toBeInTheDocument();
        await user.click(submitButton);
        expect(mutate).toHaveBeenCalledWith({
            date: expect.anything(),
            id: 1,
            notes: "test note",
            value: 25,
        });
    });

    test('Creating a new entry', async () => {
        // Arrange
        const fakeNow = new Date(2023, 5, 18, 14, 30);
        jest.useFakeTimers({ now: fakeNow });
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

        // Act
        renderComponent({ categoryId: 11 });
        const valueInput = await screen.findByLabelText('value');
        const notesInput = await screen.findByLabelText('notes');
        const submitButton = screen.getByRole('button', { name: 'submit' });

        await user.clear(valueInput);
        await user.type(valueInput, '42.42');
        await user.clear(notesInput);
        await user.type(notesInput, 'The Shiba Inu is a breed of hunting dog from Japan.');

        // Assert
        expect(submitButton).toBeInTheDocument();
        await user.click(submitButton);
        expect(mutate).toHaveBeenCalledWith({
            categoryId: 11,
            date: fakeNow,
            notes: 'The Shiba Inu is a breed of hunting dog from Japan.',
            value: 42.42,
        });

        jest.useRealTimers();
    });

    describe('Localization', () => {
        afterEach(() => {
            i18n.changeLanguage('en');
        });

        test('renders date in English format', () => {
            i18n.changeLanguage('en');
            const entry = TEST_MEASUREMENT_ENTRIES_1[0];

            const { container } = renderComponent({ entry, categoryId: 1 });

            const picker = container.querySelector('.MuiPickersInputBase-root');
            expect(picker?.textContent).toContain('02/01/2023');
            expect(picker?.textContent).toContain('08:00 AM');
        });

        test('renders date in German format', () => {
            i18n.changeLanguage('de');
            const entry = TEST_MEASUREMENT_ENTRIES_1[0];

            const { container } = renderComponent({ entry, categoryId: 1 });

            const picker = container.querySelector('.MuiPickersInputBase-root');
            expect(picker?.textContent).toContain('01.02.2023');
            expect(picker?.textContent).toContain('08:00');
            expect(picker?.textContent).not.toContain('AM');
        });
    });
});
