import { fireEvent, render, screen } from "@testing-library/react";
import i18n from "i18next";
import React from "react";
import { I18nextProvider } from "react-i18next";
import { BrowserRouter } from "react-router-dom";
import { WeightEntry } from "../../BodyWeight/model";
import { useBodyWeightQuery } from "../../BodyWeight/queries";
import { MeasurementCategory } from "../../Measurements/models/Category";
import { MeasurementEntry } from "../../Measurements/models/Entry";
import { useMeasurementsCategoryQuery } from "../../Measurements/queries";
import CalendarComponent from "./CalendarComponent";

jest.mock('../../BodyWeight/queries', () => ({
    useBodyWeightQuery: jest.fn(),
}));

jest.mock('../../Measurements/queries', () => ({
    useMeasurementsCategoryQuery: jest.fn(),
}));

describe('CalendarComponent', () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    beforeEach(() => {
        (useBodyWeightQuery as jest.Mock).mockReturnValue({
            data: [
                new WeightEntry(new Date(currentYear, currentMonth, 5), 70),
            ],
        });

        (useMeasurementsCategoryQuery as jest.Mock).mockReturnValue({
            data: [
                new MeasurementCategory(
                    1,
                    "Body Fat",
                    "%",
                    [new MeasurementEntry(1, 1, new Date(currentYear, currentMonth, 10), 20, "Normal")]
                ),
            ],
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const renderComponent = () => {
        render(
            <BrowserRouter>
                <I18nextProvider i18n={i18n}>
                    <CalendarComponent />
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

    test('displays measurement details for selected day', () => {
        renderComponent();

        const tenthDay = screen.getByText('10');
        fireEvent.click(tenthDay);
        expect(screen.getByText(/body fat: 20 %/i)).toBeInTheDocument();
    });

    test('displays weight details for selected day', () => {
        renderComponent();

        const fifthDay = screen.getByText('5');
        fireEvent.click(fifthDay);
        expect(screen.getByText('70.0 kg')).toBeInTheDocument();
    });
});