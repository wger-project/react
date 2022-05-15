import React from 'react';
import { render, screen } from '@testing-library/react';
import { WgerModal, WgerModalProps } from "components/Core/WgerModal/WgerModal";

describe("Test WgerModal component", () => {
    test('Renders title and subtitle when openFn is true', () => {

        // Arrange
        const props: WgerModalProps = {
            title: "Test title",
            subtitle: "Test subtitle",
            closeFn: () => {
            },
            isOpen: true,
            children: null
        };

        // Act
        render(<WgerModal {...props} ><p>This is some content</p></WgerModal>);

        // Assert
        expect(screen.getByText('This is some content')).toBeInTheDocument();
        expect(screen.getByText('Test title')).toBeInTheDocument();
        expect(screen.getByText('Test subtitle')).toBeInTheDocument();
    });

    test('Doesnt render anything when openFn is false', () => {

        // Arrange
        const props: WgerModalProps = {
            title: "Test title",
            subtitle: "Test subtitle",
            closeFn: () => {
            },
            isOpen: false,
            children: null
        };

        // Act
        render(<WgerModal {...props} ><p>This is some content</p></WgerModal>);

        // Assert
        expect(screen.queryByText('This is some content')).toBeNull();
        expect(screen.queryByText('Test title')).toBeNull();
        expect(screen.queryByText('Test subtitle')).toBeNull();
    });

});
