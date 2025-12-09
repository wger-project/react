import { render, screen } from "@testing-library/react";
import React from "react";
import { FastingTimerCard } from "./FastingTimerCard";

describe("FastingTimerCard", () => {
    test("renders fasting card header", () => {
        render(<FastingTimerCard />);
        expect(screen.getByText(/Fasting/i)).toBeInTheDocument();
    });

    test("shows start fast button initially", () => {
        render(<FastingTimerCard />);
        expect(
            screen.getByRole("button", { name: /start fast/i })
        ).toBeInTheDocument();
    });
});
