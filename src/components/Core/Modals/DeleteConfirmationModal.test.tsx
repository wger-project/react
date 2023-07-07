import { render, screen } from '@testing-library/react';
import { DeleteConfirmationModal, DeleteConfirmationModalProps } from "components/Core/Modals/DeleteConfirmationModal";
import userEvent from "@testing-library/user-event";

describe("Test the DeleteConfirmationModal component", () => {

    let props: DeleteConfirmationModalProps;

    beforeEach(() => {
        props = {
            title: "Do you want to delete XYZ?",
            subtitle: "the subtitle",
            message: "deleting this will also delete this other thing",
            isOpen: true,
            closeFn: jest.fn(),
            deleteFn: jest.fn()
        };
    });

    test('Renders title and subtitle when openFn is true', () => {

        // Act
        render(<DeleteConfirmationModal {...props} />);

        // Assert
        expect(screen.getByText('Do you want to delete XYZ?')).toBeInTheDocument();
        expect(screen.getByText('the subtitle')).toBeInTheDocument();
        expect(screen.getByText('deleting this will also delete this other thing')).toBeInTheDocument();
    });

    test('Doesnt render anything when isOpen is false', () => {

        // Arrange
        props.isOpen = false;

        // Act
        render(<DeleteConfirmationModal {...props} />);

        // Assert
        expect(screen.queryByText('Do you want to delete XYZ?')).toBeNull();
        expect(screen.queryByText('the subtitle')).toBeNull();
        expect(screen.queryByText('deleting this will also delete this other thing')).toBeNull();
    });

    test('Correctly fires the delete function when the delete button is clicked', async () => {

        // Arrange
        const user = userEvent.setup();

        // Act
        render(<DeleteConfirmationModal {...props} />);
        await user.click(screen.getByText('delete'));

        // Assert
        expect(props.deleteFn).toHaveBeenCalledTimes(1);
    });

});
