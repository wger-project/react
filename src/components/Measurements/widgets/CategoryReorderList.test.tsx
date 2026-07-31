import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CategoryReorderList } from "@/components/Measurements/widgets/CategoryReorderList";
import { useReorderMeasurementCategoriesQuery } from "@/components/Measurements/queries";
import React from 'react';
import { getTestQueryClient } from "@/tests/queryClient";
import { TEST_MEASUREMENT_CATEGORY_1, TEST_MEASUREMENT_CATEGORY_2 } from "@/tests/measurementsTestData";
import type { Mock } from 'vitest';

vi.mock("@/components/Measurements/queries");

const keyCodes = { space: 32, arrowDown: 40 };

describe("Test the CategoryReorderList component", () => {

    const mutateMock = vi.fn();

    beforeEach(() => {
        (useReorderMeasurementCategoriesQuery as Mock).mockImplementation(() => ({
            mutate: mutateMock
        }));
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    const renderComponent = () => render(
        <QueryClientProvider client={getTestQueryClient()}>
            <CategoryReorderList
                categories={[TEST_MEASUREMENT_CATEGORY_1, TEST_MEASUREMENT_CATEGORY_2]} />
        </QueryClientProvider>
    );

    test('renders the categories in order', () => {

        // Act
        renderComponent();

        // Assert - the drag handle props override the listitem role with "button"
        const items = screen.getAllByRole('button');
        expect(items[0]).toHaveTextContent('Biceps');
        expect(items[0]).toHaveTextContent('cm');
        expect(items[1]).toHaveTextContent('Body fat');
        expect(items[1]).toHaveTextContent('%');
    });

    test('persists the new order after a drag and drop', async () => {

        // Arrange
        renderComponent();
        const handle = screen.getByText('Biceps').closest<HTMLElement>('[data-rfd-drag-handle-draggable-id]')!;
        handle.focus();

        // Act - move the first category down one position via keyboard drag
        fireEvent.keyDown(handle, { keyCode: keyCodes.space });
        fireEvent.keyDown(handle, { keyCode: keyCodes.arrowDown });
        fireEvent.keyDown(handle, { keyCode: keyCodes.space });

        // Assert
        await waitFor(() => expect(mutateMock).toHaveBeenCalledWith(
            [TEST_MEASUREMENT_CATEGORY_2, TEST_MEASUREMENT_CATEGORY_1]
        ));
    });
});
