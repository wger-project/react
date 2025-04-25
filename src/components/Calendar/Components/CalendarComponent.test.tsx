import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WeightEntry } from "components/BodyWeight/model";
import { MeasurementCategory } from "components/Measurements/models/Category";
import { MeasurementEntry } from "components/Measurements/models/Entry";
import i18n from "i18next";
import React from "react";
import { I18nextProvider } from "react-i18next";
import { BrowserRouter } from "react-router-dom";
import { getMeasurementCategories, getNutritionalDiaryEntries, getSessions, getWeights } from "services";
import { TEST_DIARY_ENTRY_1, TEST_DIARY_ENTRY_2 } from "tests/nutritionDiaryTestdata";
import { testQueryClient } from "tests/queryClient";
import { testWorkoutSession } from "tests/workoutLogsRoutinesTestData";
import { dateToYYYYMMDD } from "utils/date";
import CalendarComponent from "./CalendarComponent";

jest.mock('services');


// TODO: using jest.useFakeTimers() and jest.setSystemTime(new Date('2024-12-01'));
//       seems to break the test and they never complete. As a workaround the dates
//       for the entries are set to the 1st and 2nd of the month, but that means
//       that this test won't work on the 1st of every month since days in the future
//       are not clickable.
describe('CalendarComponent', () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    const user = userEvent.setup();

    beforeEach(() => {

        (getWeights as jest.Mock).mockImplementation(() => Promise.resolve([
                new WeightEntry(
                    new Date(currentYear, currentMonth, 2, 12, 0),
                    70
                ),
            ]
        ));

        (getSessions as jest.Mock).mockImplementation(() => Promise.resolve([
                testWorkoutSession
            ]
        ));

        (getMeasurementCategories as jest.Mock).mockImplementation(() => Promise.resolve([
                new MeasurementCategory(
                    1,
                    "Body Fat",
                    "%",
                    [new MeasurementEntry(1, 1, new Date(currentYear, currentMonth, 1, 12, 0), 20, "Normal")]
                ),
            ],
        ));

        (getNutritionalDiaryEntries as jest.Mock).mockImplementation(() => Promise.resolve([
                TEST_DIARY_ENTRY_1,
                TEST_DIARY_ENTRY_2,
            ],
        ));

        testQueryClient.clear();
    });

    afterEach(() => {
        jest.clearAllMocks();
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
        const monthName = new Date(currentYear, currentMonth, 1).toLocaleString('en-US', { month: 'long' });
        expect(days.length).toBeGreaterThan(getDaysInMonth(currentYear, currentMonth));

        expect(screen.getByText(`${monthName} ${currentYear}`)).toBeInTheDocument();

        const weekDays = Array.from({ length: 7 }, (_, i) =>
            new Date(1970, 0, i + 5).toLocaleString('en-US', { weekday: 'short' })
        );
        weekDays.forEach((day) => {
            expect(screen.getByText(day)).toBeInTheDocument();
        });
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