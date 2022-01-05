import React from 'react';
import { render, screen } from '@testing-library/react';
import { WgerModal, WgerModalProps } from "components/Core/WgerModal/index";

describe("Test WgerModal component", () => {
    test('Renders title and subtitle when openFn is true', () => {

        // Arrange
        const props: WgerModalProps = {
            title: "Test title",
            subtitle: "Test subtitle",
            closeFn: () => {
            },
            openFn: true
        };

        // Act
        render(<WgerModal {...props} ><p>This is some content</p></WgerModal>);

        // Assert
        expect(screen.getByText('This is some content')).toBeInTheDocument();
        expect(screen.getByText('Test title')).toBeInTheDocument();
        expect(screen.getByText('Test subtitle')).toBeInTheDocument();
        expect(screen.getByText('close')).toBeInTheDocument();
    });

    test('Doesnt render anything when openFn is false', () => {

        // Arrange
        const props: WgerModalProps = {
            title: "Test title",
            subtitle: "Test subtitle",
            closeFn: () => {
            },
            openFn: false
        };

        // Act
        render(<WgerModal {...props} ><p>This is some content</p></WgerModal>);

        // Assert
        expect(screen.queryByText('This is some content')).toBeNull();
        expect(screen.queryByText('Test title')).toBeNull();
        expect(screen.queryByText('Test subtitle')).toBeNull();
        expect(screen.queryByText('close')).toBeNull();
    });

});
