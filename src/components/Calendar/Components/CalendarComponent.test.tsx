import { MeasurementCategory, MeasurementEntry } from "@/components/Measurements";
import { WeightEntry } from "@/components/Weight";
import { getMeasurementCategories } from "@/components/Measurements/api/measurements";
import { getNutritionalDiaryEntries } from "@/components/Nutrition/api/nutritionalDiary";
import { getSessions } from "@/components/Routines/api/session";
import { getWeights } from "@/components/Weight/api/weight";
import { TEST_DIARY_ENTRY_1, TEST_DIARY_ENTRY_2 } from "@/tests/nutritionDiaryTestdata";
import { testQueryClient } from "@/tests/queryClient";
import { testWorkoutSession } from "@/tests/workoutLogsRoutinesTestData";
import { dateToYYYYMMDD } from "@/core/lib/date";
import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import React from "react";
import { I18nextProvider } from "react-i18next";
import { BrowserRouter } from "react-router-dom";
import type { Mock } from 'vitest';
import CalendarComponent from "./CalendarComponent";

vi.mock("@/components/Measurements/api/measurements");
vi.mock("@/components/Nutrition/api/nutritionalDiary");
vi.mock("@/components/Routines/api/session");
vi.mock("@/components/Weight/api/weight");


/*
 * The calendar renders relative to "today", so the clock is fixed to the middle of
 * a month. shouldAdvanceTime keeps the timers running, without it the queries never
 * resolve and the tests time out.
 */
describe('CalendarComponent', () => {
    // A Sunday, so the grid needs the maximum number of leading days
    const currentYear = 2024;
    const currentMonth = 11;
    const today = new Date(currentYear, currentMonth, 15, 12, 0);

    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        vi.setSystemTime(today);
        user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

        (getWeights as Mock).mockImplementation(() => Promise.resolve([
            new WeightEntry(
                new Date(currentYear, currentMonth, 2, 12, 0),
                70
            ),
        ]));

        (getSessions as Mock).mockImplementation(() => Promise.resolve(
            [testWorkoutSession]
        ));

        (getMeasurementCategories as Mock).mockImplementation(() => Promise.resolve([
            new MeasurementCategory(
                'cccccccc-cccc-cccc-cccc-000000000001',
                "Body Fat",
                "%",
                [new MeasurementEntry(
                    'dddddddd-dddd-dddd-dddd-000000000001',
                    'cccccccc-cccc-cccc-cccc-000000000001',
                    new Date(currentYear, currentMonth, 1, 12, 0), 20, "Normal"
                )]
            ),
        ]));

        (getNutritionalDiaryEntries as Mock).mockImplementation(() => Promise.resolve([
            TEST_DIARY_ENTRY_1,
            TEST_DIARY_ENTRY_2,
        ]));

        testQueryClient.clear();
    });

    afterEach(() => {
        vi.clearAllMocks();
        vi.useRealTimers();
    });

    const renderComponent = () => {
        render(
            <BrowserRouter>
                <I18nextProvider i18n={i18n}>
                    <QueryClientProvider client={testQueryClient}>
                        <CalendarComponent />
                    </QueryClientProvider>
                </I18nextProvider>
            </BrowserRouter>
        );
    };

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    test("renders calendar with days and header", () => {
        renderComponent();
        const days = screen.getAllByText(/^\d+$/);
        expect(days.length).toBeGreaterThan(getDaysInMonth(currentYear, currentMonth));

        expect(screen.getByText('December 2024')).toBeInTheDocument();

        // The week starts on monday
        ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach((day) => {
            expect(screen.getByText(day)).toBeInTheDocument();
        });
    });

    test('pads the grid with the surrounding months so the columns line up', () => {
        renderComponent();

        // December 2024 starts on a sunday and ends on a tuesday, so the grid needs
        // six leading days from november and five trailing ones from january
        expect(screen.getByTestId('day-2024-11-25')).toBeInTheDocument();
        expect(screen.getByTestId('day-2024-12-01')).toBeInTheDocument();
        expect(screen.getByTestId('day-2024-12-31')).toBeInTheDocument();
        expect(screen.getByTestId('day-2025-01-05')).toBeInTheDocument();

        expect(screen.queryByTestId('day-2024-11-24')).not.toBeInTheDocument();
        expect(screen.queryByTestId('day-2025-01-06')).not.toBeInTheDocument();

        // 6 + 31 + 5, always full weeks
        const dayCells = screen.getAllByTestId(/^day-\d{4}-\d{2}-\d{2}$/);
        expect(dayCells).toHaveLength(42);
        expect(dayCells.length % 7).toBe(0);
    });

    test('does not navigate past the current month', () => {
        renderComponent();

        // Act - there is nothing to log in the future
        fireEvent.click(screen.getByText('>'));

        // Assert
        expect(screen.getByText('December 2024')).toBeInTheDocument();

        // ...but going back and forth again works
        fireEvent.click(screen.getByText('<'));
        expect(screen.getByText('November 2024')).toBeInTheDocument();
        fireEvent.click(screen.getByText('>'));
        expect(screen.getByText('December 2024')).toBeInTheDocument();
    });

    test('navigates to previous and next month', () => {
        renderComponent();

        const previousMonthDate = new Date(currentYear, currentMonth - 1, 1);
        const previousMonthName = previousMonthDate.toLocaleString('en-US', { month: 'long' });
        const previousMonthYear = previousMonthDate.getFullYear();

        fireEvent.click(screen.getByText('<'));
        expect(screen.getByText(`${previousMonthName} ${previousMonthYear}`)).toBeInTheDocument();

        fireEvent.click(screen.getByText('>'));
        const currentMonthName = today.toLocaleString('en-US', { month: 'long' });
        expect(screen.getByText(`${currentMonthName} ${currentYear}`)).toBeInTheDocument();
    });

    test('displays measurement details for selected day', async () => {
        // Arrange
        renderComponent();

        // Act
        const day = await screen.findByTestId(`day-${dateToYYYYMMDD(new Date(currentYear, currentMonth, 1))}`);
        await user.click(day);

        // Assert
        expect(await screen.findByText(/body fat: 20 %/i)).toBeInTheDocument();
    });

    test('displays weight details for selected day', async () => {
        // Arrange
        renderComponent();

        // Act
        const day = screen.getByTestId(`day-${dateToYYYYMMDD(new Date(currentYear, currentMonth, 2))}`);
        await user.click(day);

        // Assert
        expect(screen.getByText('70.0')).toBeInTheDocument();
    });
});