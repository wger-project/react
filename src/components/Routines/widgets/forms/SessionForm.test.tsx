import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorkoutSession } from "@/components/Routines/models/WorkoutSession";
import { useAddSessionQuery, useEditSessionQuery, useSessionOfDay } from "@/components/Routines/queries";
import { DateTime } from 'luxon';
import { BrowserRouter } from "react-router-dom";
import { SessionForm } from './SessionForm';
import type { Mock } from 'vitest';


vi.mock("@/components/Routines/queries");
const mockUseSessionOfDay = useSessionOfDay as Mock;
const mockUseAddSessionQuery = useAddSessionQuery as Mock;
const mockUseEditSessionQuery = useEditSessionQuery as Mock;

describe('SessionForm', () => {
    const routineId = 1;
    const dayId = 2;

    let addMutateAsync: Mock;
    let editMutateAsync: Mock;

    beforeEach(() => {
        mockUseSessionOfDay.mockClear();
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

    /* Stands in for the screen, which owns the session the form works on */
    const Harness = (props: { selectedDate: DateTime, setSelectedDate: (date: DateTime) => void }) => {
        const [chosenSessionId, setChosenSessionId] = React.useState<string | null>(null);

        return <SessionForm
            dayId={dayId}
            routineId={routineId}
            selectedDate={props.selectedDate}
            setSelectedDate={props.setSelectedDate}
            chosenSessionId={chosenSessionId}
            setChosenSessionId={setChosenSessionId} />;
    };

    const renderForm = (selectedDate: DateTime, setSelectedDate: (date: DateTime) => void = () => {
    }) => render(
        <BrowserRouter>
            <Harness selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
        </BrowserRouter>
    );

    /* What the real hook does: a lone session is the one, several wait for a pick */
    const lookupReturning = (sessions: WorkoutSession[]) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (...args: any[]) => ({
            sessions: sessions,
            session: sessions.length === 1 ? sessions[0] : sessions.find(entry => entry.id === args[3]),
            isLoading: false,
            isSuccess: true,
        });

    test('looks up the session for the currently selected date', async () => {
        // Arrange
        mockUseSessionOfDay.mockImplementation(lookupReturning([]));

        // Act
        const { rerender } = renderForm(DateTime.fromISO('2024-05-01'));

        // Assert
        expect(mockUseSessionOfDay).toHaveBeenCalledWith(
            routineId,
            dayId,
            DateTime.fromISO('2024-05-01'),
            null
        );

        // Act - the parent selects another date
        rerender(
            <BrowserRouter>
                <Harness selectedDate={DateTime.fromISO('2024-05-08')} setSelectedDate={() => {
                }} />
            </BrowserRouter>
        );

        // Assert
        expect(mockUseSessionOfDay).toHaveBeenLastCalledWith(
            routineId,
            dayId,
            DateTime.fromISO('2024-05-08'),
            null
        );
    });

    test('reports a date picked in the form back to the parent', async () => {
        // Arrange
        const user = userEvent.setup();
        const setSelectedDate = vi.fn();
        mockUseSessionOfDay.mockImplementation(lookupReturning([]));

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

        mockUseSessionOfDay.mockImplementation(lookupReturning([mockSession]));

        // Act
        renderForm(DateTime.now());

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
        mockUseSessionOfDay.mockImplementation(lookupReturning([]));

        renderForm(DateTime.now());

        await waitFor(() => {
            expect((screen.getByRole('textbox', { name: /notes/i }) as HTMLTextAreaElement).value).toBe('');
        });
    });

    test('submits a new session through the add mutation', async () => {

        // Arrange
        const user = userEvent.setup();
        mockUseSessionOfDay.mockImplementation(lookupReturning([]));

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
        mockUseSessionOfDay.mockImplementation(lookupReturning([]));
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

    /* Two sessions on the same day, which the server allows since 2.7 */
    const twoSessions = () => [
        new WorkoutSession({
            id: 'bbbbbbbb-bbbb-bbbb-bbbb-000000000001',
            dayId: dayId,
            routineId: routineId,
            notes: 'morning workout',
            impression: '3',
            datetimeStart: DateTime.fromISO('2024-05-01T08:00').toJSDate(),
            datetimeEnd: null,
        }),
        new WorkoutSession({
            id: 'bbbbbbbb-bbbb-bbbb-bbbb-000000000002',
            dayId: dayId,
            routineId: routineId,
            notes: 'evening workout',
            impression: '2',
            datetimeStart: DateTime.fromISO('2024-05-01T18:30').toJSDate(),
            datetimeEnd: null,
        }),
    ];

    test('lets the user pick when the day has several sessions', async () => {

        // Arrange
        mockUseSessionOfDay.mockImplementation(lookupReturning(twoSessions()));

        // Act
        renderForm(DateTime.fromISO('2024-05-01'));

        // Assert
        // Both are offered, and nothing is edited until one is chosen
        expect(screen.getByText('routines.multipleSessions')).toBeInTheDocument();
        expect(screen.getByText(/morning workout/)).toBeInTheDocument();
        expect(screen.getByText(/evening workout/)).toBeInTheDocument();
        expect(screen.getByText('routines.newSession')).toBeInTheDocument();
        expect(screen.queryByRole('textbox', { name: /notes/i })).not.toBeInTheDocument();
    });

    test('edits the session picked from the list', async () => {

        // Arrange
        const user = userEvent.setup();
        mockUseSessionOfDay.mockImplementation(lookupReturning(twoSessions()));

        // Act
        renderForm(DateTime.fromISO('2024-05-01'));
        await user.click(screen.getByText(/evening workout/));

        // Assert
        await waitFor(() =>
            expect((screen.getByRole('textbox', { name: /notes/i }) as HTMLTextAreaElement).value)
                .toBe('evening workout')
        );

        await user.click(screen.getByRole('button', { name: /submit/i }));
        await waitFor(() => expect(editMutateAsync).toHaveBeenCalled());
        const draft = editMutateAsync.mock.calls[0][0] as WorkoutSession;
        expect(draft.id).toBe('bbbbbbbb-bbbb-bbbb-bbbb-000000000002');
    });

    test('adds another session to a day that already has some', async () => {

        // Arrange
        const user = userEvent.setup();
        mockUseSessionOfDay.mockImplementation(lookupReturning(twoSessions()));

        // Act
        renderForm(DateTime.fromISO('2024-05-01'));
        await user.click(screen.getByText('routines.newSession'));

        // Assert
        await waitFor(() =>
            expect((screen.getByRole('textbox', { name: /notes/i }) as HTMLTextAreaElement).value).toBe('')
        );

        await user.click(screen.getByRole('button', { name: /submit/i }));
        await waitFor(() => expect(addMutateAsync).toHaveBeenCalled());
        expect(editMutateAsync).not.toHaveBeenCalled();
    });

    test('offers the choice again after going back', async () => {

        // Arrange
        const user = userEvent.setup();
        mockUseSessionOfDay.mockImplementation(lookupReturning(twoSessions()));

        // Act
        renderForm(DateTime.fromISO('2024-05-01'));
        await user.click(screen.getByText(/evening workout/));
        await waitFor(() => expect(screen.getByRole('textbox', { name: /notes/i })).toBeInTheDocument());
        await user.click(screen.getByText('routines.changeSession'));

        // Assert
        expect(screen.getByText('routines.multipleSessions')).toBeInTheDocument();
        expect(screen.queryByRole('textbox', { name: /notes/i })).not.toBeInTheDocument();
    });

    test('submits a session that runs past midnight with the end on the next day', async () => {

        // Arrange
        const user = userEvent.setup();
        mockUseSessionOfDay.mockImplementation(lookupReturning([new WorkoutSession({
            id: null,
            dayId: dayId,
            routineId: routineId,
            notes: '',
            impression: '2',
            datetimeStart: DateTime.fromISO('2024-05-01T23:00').toJSDate(),
            datetimeEnd: DateTime.fromISO('2024-05-01T01:30').toJSDate(),
        })]));

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
        mockUseSessionOfDay.mockImplementation(lookupReturning([mockSession]));

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