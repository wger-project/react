import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorkoutSession } from "components/WorkoutRoutines/models/WorkoutSession";
import { useAddSessionQuery, useEditSessionQuery, useFindSessionQuery } from "components/WorkoutRoutines/queries";
import { DateTime } from 'luxon';
import { BrowserRouter } from "react-router-dom";
import { SessionForm } from './SessionForm';


jest.mock("components/WorkoutRoutines/queries");
const mockUseFindSessionQuery = useFindSessionQuery as jest.Mock;
const mockUseAddSessionQuery = useAddSessionQuery as jest.Mock;
const mockUseEditSessionQuery = useEditSessionQuery as jest.Mock;

describe('SessionForm', () => {
    const routineId = 1;
    const dayId = 2;

    beforeEach(() => {
        mockUseFindSessionQuery.mockClear();
        mockUseAddSessionQuery.mockReturnValue({
            data: null,
            isPending: false,
        });
        mockUseEditSessionQuery.mockReturnValue({
            data: null,
            isPending: false,
        });
    });

    test('calls useFindSessionQuery with the correct parameters when the date changes', async () => {
        // Arrange
        const user = userEvent.setup();
        const mockSession = new WorkoutSession(0, 0, 0, new Date(), '', "1", null, null);
        mockUseFindSessionQuery.mockReturnValue({
            data: mockSession,
            isLoading: false,
            isSuccess: true
        });

        // Act
        render(<BrowserRouter>
            <SessionForm
                dayId={dayId}
                routineId={routineId}
                selectedDate={DateTime.now()}
                setSelectedDate={() => {
                }} />
            </BrowserRouter>
        );

        // Assert
        const datePicker = screen.getByRole('textbox', { name: /date/i });
        const newDate = DateTime.now();

        await user.type(datePicker, newDate.toFormat('yyyy-MM-dd'));
        await user.tab();

        expect(mockUseFindSessionQuery).toHaveBeenCalledWith(
            1,
            {
                routine: routineId,
                date: newDate.toFormat('yyyy-MM-dd'),
                day: 2

            }
        );
    });

    test('updates the form values when a session is found', async () => {

        // Arrange
        const date = DateTime.now();
        const formattedDate = date.toLocaleString(DateTime.DATE_SHORT, { locale: 'en-us' });

        const timeStart = DateTime.now().set({ hour: 10, minute: 30 });
        const timeStartFormatted = timeStart.toLocaleString(DateTime.TIME_SIMPLE, { locale: 'en-us' });

        const timeEnd = DateTime.now().set({ hour: 11, minute: 0 });
        const timeEndFormatted = timeEnd.toLocaleString(DateTime.TIME_SIMPLE, { locale: 'en-us' });

        const mockSession = new WorkoutSession(
            1,
            dayId,
            routineId,
            date.toJSDate(),
            'Test notes',
            '3',
            timeStart.toJSDate(),
            timeEnd.toJSDate()
        );

        mockUseFindSessionQuery.mockReturnValue({
            data: mockSession,
            isLoading: false,
            isSuccess: true
        });

        // Act
        render(<BrowserRouter>
            <SessionForm
                dayId={dayId}
                routineId={routineId}
                selectedDate={DateTime.now()}
                setSelectedDate={() => {
                }} />
        </BrowserRouter>);

        // Assert
        await waitFor(() => {
            screen.logTestingPlaygroundURL();
            expect((screen.getByRole('textbox', { name: /notes/i }) as HTMLTextAreaElement).value).toBe('Test notes');

            // The date and time pickers are localized
            expect((screen.getByRole('textbox', { name: /date/i }) as HTMLInputElement).value).toBe(formattedDate);
            expect((screen.getByRole('textbox', { name: /start/i }) as HTMLInputElement).value).toBe(timeStartFormatted);
            expect((screen.getByRole('textbox', { name: /end/i }) as HTMLInputElement).value).toBe(timeEndFormatted);

        });
    });

    test('sets default values when no session is found', async () => {
        mockUseFindSessionQuery.mockReturnValue({
            data: null,
            isLoading: false,
            isSuccess: true,
        });

        render(<BrowserRouter>
            <SessionForm
                dayId={dayId}
                routineId={routineId}
                selectedDate={DateTime.now()}
                setSelectedDate={() => {
                }} />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect((screen.getByRole('textbox', { name: /notes/i }) as HTMLTextAreaElement).value).toBe('');
        });
    });
});