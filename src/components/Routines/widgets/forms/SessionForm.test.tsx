import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorkoutSession } from "@/components/Routines/models/WorkoutSession";
import { useAddSessionQuery, useEditSessionQuery, useFindSessionQuery } from "@/components/Routines/queries";
import { DateTime } from 'luxon';
import { BrowserRouter } from "react-router-dom";
import { SessionForm } from './SessionForm';
import type { Mock } from 'vitest';


vi.mock("@/components/Routines/queries");
const mockUseFindSessionQuery = useFindSessionQuery as Mock;
const mockUseAddSessionQuery = useAddSessionQuery as Mock;
const mockUseEditSessionQuery = useEditSessionQuery as Mock;

describe('SessionForm', () => {
    const routineId = 1;
    const dayId = 2;

    let addMutateAsync: Mock;
    let editMutateAsync: Mock;

    beforeEach(() => {
        mockUseFindSessionQuery.mockClear();
        addMutateAsync = vi.fn().mockResolvedValue(undefined);
        editMutateAsync = vi.fn().mockResolvedValue(undefined);
        mockUseAddSessionQuery.mockReturnValue({
            data: null,
            isPending: false,
            mutateAsync: addMutateAsync,
        });
        mockUseEditSessionQuery.mockReturnValue({
            data: null,
            isPending: false,
            mutateAsync: editMutateAsync,
        });
    });

    const renderForm = (selectedDate: DateTime, setSelectedDate: React.Dispatch<React.SetStateAction<DateTime>> = () => {
    }) => render(
        <BrowserRouter>
            <SessionForm
                dayId={dayId}
                routineId={routineId}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate} />
        </BrowserRouter>
    );

    test('looks up the session for the currently selected date', async () => {
        // Arrange
        mockUseFindSessionQuery.mockReturnValue({
            data: null,
            isLoading: false,
            isSuccess: true
        });

        // Act
        const { rerender } = renderForm(DateTime.fromISO('2024-05-01'));

        // Assert
        expect(mockUseFindSessionQuery).toHaveBeenCalledWith(
            routineId,
            { routine: routineId, datetime_start__date: '2024-05-01', day: dayId }
        );

        // Act - the parent selects another date
        rerender(
            <BrowserRouter>
                <SessionForm
                    dayId={dayId}
                    routineId={routineId}
                    selectedDate={DateTime.fromISO('2024-05-08')}
                    setSelectedDate={() => {
                    }} />
            </BrowserRouter>
        );

        // Assert
        expect(mockUseFindSessionQuery).toHaveBeenLastCalledWith(
            routineId,
            { routine: routineId, datetime_start__date: '2024-05-08', day: dayId }
        );
    });

    test('reports a date picked in the form back to the parent', async () => {
        // Arrange
        const user = userEvent.setup();
        const setSelectedDate = vi.fn();
        mockUseFindSessionQuery.mockReturnValue({
            data: null,
            isLoading: false,
            isSuccess: true
        });

        // Act
        renderForm(DateTime.fromISO('2024-05-01'), setSelectedDate);
        const dateGroup = screen.getByRole('group', { name: /date/i });
        await user.click(within(dateGroup).getByRole('spinbutton', { name: /year/i }));
        await user.keyboard('2025');

        // Assert
        // The picker hands the edited value to the parent, which owns the selected date.
        // The concrete value can't be asserted here: the date field's section navigation
        // doesn't work under happy-dom, so only the year section really changes.
        await waitFor(() => expect(setSelectedDate).toHaveBeenCalled());
        const reported = setSelectedDate.mock.calls.at(-1)![0] as DateTime;
        expect(reported).toBeInstanceOf(DateTime);
        expect(reported.year).toBe(2025);
    });

    test('updates the form values when a session is found', async () => {

        // Arrange
        const date = DateTime.now();
        const formattedDate = new Date().toLocaleDateString(
            'en-us',
            { year: 'numeric', month: '2-digit', day: '2-digit' }
        );

        const timeStart = DateTime.now().set({ hour: 10, minute: 30 });
        const timeStartFormatted = timeStart.toLocaleString(DateTime.TIME_SIMPLE, { locale: 'en-us' });

        const timeEnd = DateTime.now().set({ hour: 11, minute: 0 });
        const timeEndFormatted = timeEnd.toLocaleString(DateTime.TIME_SIMPLE, { locale: 'en-us' });

        const mockSession = new WorkoutSession({
            id: 'bbbbbbbb-bbbb-bbbb-bbbb-000000000001',
            dayId: dayId,
            routineId: routineId,

            notes: 'Test notes',
            impression: '3',
            datetimeStart: timeStart.toJSDate(),
            datetimeEnd: timeEnd.toJSDate()
        });

        mockUseFindSessionQuery.mockReturnValue({
            data: mockSession,
            isLoading: false,
            isSuccess: true
        });

        // Act
        render(
            <BrowserRouter>
                <SessionForm
                    dayId={dayId}
                    routineId={routineId}
                    selectedDate={DateTime.now()}
                    setSelectedDate={() => {
                    }} />
            </BrowserRouter>
        );

        // Assert
        await waitFor(() => {
            // screen.logTestingPlaygroundURL();
            expect((screen.getByRole('textbox', { name: /notes/i }) as HTMLTextAreaElement).value).toBe('Test notes');

            // The date and time pickers are localized
            const dateGroup = screen.getByRole('group', { name: /date/i });
            expect(within(dateGroup).getByRole('textbox', { hidden: true })).toHaveValue(formattedDate);

            const startGroup = screen.getByRole('group', { name: /start/i });
            expect(within(startGroup).getByRole('textbox', { hidden: true })).toHaveValue(timeStartFormatted);

            const endGroup = screen.getByRole('group', { name: /end/i });
            expect(within(endGroup).getByRole('textbox', { hidden: true })).toHaveValue(timeEndFormatted);
        });
    });

    test('sets default values when no session is found', async () => {
        mockUseFindSessionQuery.mockReturnValue({
            data: null,
            isLoading: false,
            isSuccess: true,
        });

        render(
            <BrowserRouter>
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

    test('submits a new session through the add mutation', async () => {

        // Arrange
        const user = userEvent.setup();
        mockUseFindSessionQuery.mockReturnValue({
            data: null,
            isLoading: false,
            isSuccess: true
        });

        // Act
        renderForm(DateTime.fromISO('2024-05-01'));
        await user.type(screen.getByRole('textbox', { name: /notes/i }), 'Great session');
        await user.click(screen.getByRole('button', { name: /submit/i }));

        // Assert
        await waitFor(() => expect(addMutateAsync).toHaveBeenCalled());
        const draft = addMutateAsync.mock.calls[0][0] as WorkoutSession;
        expect(draft.id).toBeNull();
        expect(draft.routineId).toBe(routineId);
        expect(draft.dayId).toBe(dayId);
        expect(draft.notes).toBe('Great session');
        expect(editMutateAsync).not.toHaveBeenCalled();
    });

    test('shows what the server rejected', async () => {

        // Arrange
        mockUseFindSessionQuery.mockReturnValue({
            data: null,
            isLoading: false,
            isSuccess: true
        });
        mockUseAddSessionQuery.mockReturnValue({
            data: null,
            isPending: false,
            mutateAsync: addMutateAsync,
            isError: true,
            error: {
                message: 'Request failed with status code 400',
                response: { data: { datetime_end: ['A session cannot be longer than 5 hours.'] } }
            },
        });

        // Act
        renderForm(DateTime.fromISO('2024-05-01'));

        // Assert
        expect(screen.getByText(/A session cannot be longer than 5 hours/)).toBeInTheDocument();
    });

    test('submits a session that runs past midnight with the end on the next day', async () => {

        // Arrange
        const user = userEvent.setup();
        mockUseFindSessionQuery.mockReturnValue({
            data: new WorkoutSession({
                id: null,
                dayId: dayId,
                routineId: routineId,
                notes: '',
                impression: '2',
                datetimeStart: DateTime.fromISO('2024-05-01T23:00').toJSDate(),
                datetimeEnd: DateTime.fromISO('2024-05-01T01:30').toJSDate(),
            }),
            isLoading: false,
            isSuccess: true
        });

        // Act
        renderForm(DateTime.fromISO('2024-05-01'));
        await user.click(screen.getByRole('button', { name: /submit/i }));

        // Assert
        await waitFor(() => expect(editMutateAsync).toHaveBeenCalled());
        const draft = editMutateAsync.mock.calls[0][0] as WorkoutSession;
        expect(draft.datetimeStart).toEqual(DateTime.fromISO('2024-05-01T23:00').toJSDate());
        expect(draft.datetimeEnd).toEqual(DateTime.fromISO('2024-05-02T01:30').toJSDate());
    });

    test('submits an existing session through the edit mutation', async () => {

        // Arrange
        const user = userEvent.setup();
        const mockSession = new WorkoutSession({
            id: 'bbbbbbbb-bbbb-bbbb-bbbb-000000000001',
            dayId: dayId,
            routineId: routineId,

            notes: 'Test notes',
            impression: '3',
            datetimeStart: DateTime.fromISO('2024-05-01').toJSDate(),
            datetimeEnd: null
        });
        mockUseFindSessionQuery.mockReturnValue({
            data: mockSession,
            isLoading: false,
            isSuccess: true
        });

        // Act
        renderForm(DateTime.fromISO('2024-05-01'));
        await waitFor(() =>
            expect(screen.getByRole('textbox', { name: /notes/i })).toHaveValue('Test notes')
        );
        await user.click(screen.getByRole('button', { name: /submit/i }));

        // Assert
        await waitFor(() => expect(editMutateAsync).toHaveBeenCalled());
        const draft = editMutateAsync.mock.calls[0][0] as WorkoutSession;
        expect(draft.id).toBe(mockSession.id);
        expect(draft.notes).toBe('Test notes');
        expect(addMutateAsync).not.toHaveBeenCalled();
    });
});