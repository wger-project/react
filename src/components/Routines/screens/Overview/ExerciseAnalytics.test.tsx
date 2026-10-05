import { getLanguages } from "@/components/Exercises/api/language";
import { getWorkoutLogs } from "@/components/Routines/api/workoutLogs";
import { getRoutinesShallow } from "@/components/Routines/api/routine";
import { ExerciseAnalytics } from "@/components/Routines/screens/Overview/ExerciseAnalytics";
import { analyticsLog } from "@/tests/analyticsTestData";
import { testExerciseSquats, testLanguages, testMuscleBiggus } from "@/tests/exerciseTestdata";
import { getTestQueryClient } from "@/tests/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { WgerRoutes } from "@/routes";

vi.mock('@/components/Routines/api/workoutLogs');
vi.mock('@/components/Exercises/api/language');
vi.mock('@/components/Routines/api/routine');

const renderPage = () => render(<MemoryRouter>
    <QueryClientProvider client={getTestQueryClient()}><ExerciseAnalytics /></QueryClientProvider>
</MemoryRouter>);

beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getLanguages).mockResolvedValue(testLanguages);
    vi.mocked(getWorkoutLogs).mockResolvedValue([
        analyticsLog(), analyticsLog({ id: 'second', routineId: 2, weight: 60, repetitions: 5 }),
    ]);
});

test('defaults to weight and all history; metrics and table reflect logs across routines', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => expect(getWorkoutLogs).toHaveBeenCalledWith({ loadExercises: true, filtersetQuery: {} }));
    expect(screen.getByRole('combobox', { name: 'routines.analytics.metric' })).toHaveTextContent('weight');
    await user.click(screen.getByRole('button', { name: 'routines.analytics.tableView' }));
    expect(await screen.findByRole('cell', { name: '60' })).toBeInTheDocument();
    await user.click(screen.getByRole('combobox', { name: 'routines.analytics.metric' }));
    await user.click(screen.getByRole('option', { name: 'routines.volume' }));
    expect(screen.getByRole('cell', { name: '800' })).toBeInTheDocument();
    await user.click(screen.getByRole('combobox', { name: 'routines.analytics.metric' }));
    await user.click(screen.getByRole('option', { name: 'routines.reps' }));
    expect(screen.getByRole('cell', { name: '15' })).toBeInTheDocument();
    expect(getWorkoutLogs).toHaveBeenCalledTimes(1);
});

test('exercise and muscle selectors filter the displayed history', async () => {
    const user = userEvent.setup();
    vi.mocked(getWorkoutLogs).mockResolvedValue([
        analyticsLog(), analyticsLog({ id: 'unknown', exerciseId: 999, exerciseObj: undefined, weight: 999 }),
    ]);
    renderPage();
    await user.click(screen.getByRole('button', { name: 'routines.analytics.tableView' }));
    expect(await screen.findByRole('cell', { name: '999' })).toBeInTheDocument();
    await user.click(screen.getByRole('combobox', { name: 'routines.analytics.muscle' }));
    await user.click(await screen.findByRole('option', { name: testMuscleBiggus.getName() }));
    expect(screen.queryByRole('cell', { name: '999' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('combobox', { name: 'routines.analytics.exercise' }));
    await user.click(screen.getByRole('option', { name: testExerciseSquats.getTranslation().name }));
    expect(screen.getByRole('cell', { name: '50' })).toBeInTheDocument();
});

test('a new date range queries the server and shows an empty state without losing controls', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => expect(getWorkoutLogs).toHaveBeenCalledTimes(1));
    await user.click(screen.getByRole('combobox', { name: 'routines.analytics.exercise' }));
    await user.click(await screen.findByRole('option', { name: testExerciseSquats.getTranslation().name }));
    vi.mocked(getWorkoutLogs).mockResolvedValue([]);
    await user.click(screen.getByRole('button', { name: 'measurements.chartRangeWeeks' }));
    expect(await screen.findByText('routines.analytics.empty')).toBeInTheDocument();
    expect(getWorkoutLogs).toHaveBeenLastCalledWith({ loadExercises: true, filtersetQuery: {
        date__gte: expect.any(String), date__lt: expect.any(String),
    } });
    expect(screen.getByRole('combobox', { name: 'routines.analytics.exercise' })).toBeEnabled();
    expect(screen.getByRole('combobox', { name: 'routines.analytics.exercise' })).toHaveValue('Squats');
    await user.click(screen.getByRole('combobox', { name: 'routines.analytics.exercise' }));
    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.getByRole('combobox', { name: 'routines.analytics.exercise' })).toHaveValue('');
});

test('bodyweight volume is visible in its own unit instead of a zero weighted total', async () => {
    const user = userEvent.setup();
    vi.mocked(getWorkoutLogs).mockResolvedValue([analyticsLog(), analyticsLog({ id: 'body', weight: 0, repetitions: 20 })]);
    renderPage();
    await user.click(screen.getByRole('combobox', { name: 'routines.analytics.metric' }));
    await user.click(screen.getByRole('option', { name: 'routines.volume' }));
    await user.click(screen.getByRole('button', { name: 'routines.analytics.tableView' }));
    const weighted = await screen.findByRole('table', { name: 'routines.analytics.kgReps' });
    expect(within(weighted).getByRole('cell', { name: '500' })).toBeInTheDocument();
    const bodyweight = screen.getByRole('table', { name: 'routines.reps' });
    expect(within(bodyweight).getByRole('cell', { name: '20' })).toBeInTheDocument();
});

test('shows a pending state and can retry a failed history request', async () => {
    const user = userEvent.setup();
    let rejectRequest: (error: Error) => void = () => {};
    vi.mocked(getWorkoutLogs).mockImplementationOnce(() => new Promise((_, reject) => { rejectRequest = reject; }));
    renderPage();
    expect(screen.queryByText('routines.analytics.empty')).not.toBeInTheDocument();
    await waitFor(() => expect(getWorkoutLogs).toHaveBeenCalled());
    rejectRequest(new Error('offline'));
    expect(await screen.findByText('routines.analytics.loadError')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'routines.analytics.retry' }));
    await waitFor(() => expect(screen.queryByText('routines.analytics.loadError')).not.toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'routines.analytics.tableView' }));
    expect(await screen.findByRole('cell', { name: '60' })).toBeInTheDocument();
});

test('routine overview menu opens the independent analytics route even without routines', async () => {
    const user = userEvent.setup();
    vi.mocked(getRoutinesShallow).mockResolvedValue([]);
    render(<MemoryRouter initialEntries={['/en/routine/overview']}>
        <QueryClientProvider client={getTestQueryClient()}><WgerRoutes /></QueryClientProvider>
    </MemoryRouter>);
    await user.click(await screen.findByRole('button', { name: 'routines.analytics.menu' }));
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menuitem')).not.toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'routines.analytics.menu' }));
    const link = screen.getByRole('menuitem', { name: 'routines.analytics.title' });
    expect(link).toHaveAttribute('href', '/en/routine/analytics');
    await user.click(link);
    expect(await screen.findByText('routines.analytics.description')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'routines.routines' })).toHaveAttribute('href', '/en/routine/overview');
    await waitFor(() => expect(getWorkoutLogs).toHaveBeenCalledWith({ loadExercises: true, filtersetQuery: {} }));
});
