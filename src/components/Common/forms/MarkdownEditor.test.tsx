import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MarkdownEditor } from './MarkdownEditor';
import '@testing-library/jest-dom';

describe('MarkdownEditor', () => {
    const mockChange = jest.fn();

    it('renders in Write mode by default', () => {
        render(<MarkdownEditor value="Test content" onChange={mockChange} />);
        // Check for the textarea
        expect(screen.getByRole('textbox')).toBeInTheDocument();
        // Check content exists inside textbox
        expect(screen.getByDisplayValue('Test content')).toBeInTheDocument();
    });

    it('calls onChange when typing', () => {
        render(<MarkdownEditor value="" onChange={mockChange} />);
        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'New text' } });
        expect(mockChange).toHaveBeenCalledWith('New text');
    });

    it('toggles to preview mode and renders basic formatting', () => {
        const markdown = "This is **bold** and *italic*";
        render(<MarkdownEditor value={markdown} onChange={mockChange} />);

        // Switch to Preview
        fireEvent.click(screen.getByText('Preview'));

        // Check that bold and italic tags are rendered
        // Note: markdown-to-jsx might use <strong> or <b>, check your overrides.
        // We overrode 'strong' to 'strong', so we look for that.
        const boldElement = screen.getByText('bold');
        expect(boldElement.tagName).toBe('STRONG');

        const italicElement = screen.getByText('italic');
        expect(italicElement.tagName).toBe('EM');
    });

    it('blocks Heading tags (h1-h6) and renders them as plain text/paragraphs', () => {
        // We provide a # Heading. 
        // Expected result: Text "Forbidden Heading" is visible, but NOT inside an <h1> tag.
        render(<MarkdownEditor value="# Forbidden Heading" onChange={mockChange} />);

        fireEvent.click(screen.getByText('Preview'));

        // 1. The text should still be readable
        expect(screen.getByText('Forbidden Heading')).toBeInTheDocument();

        // 2. But there should be NO heading role in the document
        const heading = screen.queryByRole('heading', { level: 1 });
        expect(heading).toBeNull();
    });

    it('blocks Link tags (a) and renders plain text', () => {
        const markdown = "[Malicious Link](http://evil.com)";
        render(<MarkdownEditor value={markdown} onChange={mockChange} />);

        fireEvent.click(screen.getByText('Preview'));

        // 1. The text anchor should be visible
        expect(screen.getByText('Malicious Link')).toBeInTheDocument();

        // 2. But it should NOT be a link (no anchor tag)
        const link = screen.queryByRole('link');
        expect(link).toBeNull();

        // 3. Ensure the href is not present in the DOM (security check)
        const textElement = screen.getByText('Malicious Link');
        expect(textElement).not.toHaveAttribute('href');
    });

    it('blocks Images', () => {
        // Image syntax: ![alt text](url)
        render(<MarkdownEditor value="![Hidden Image](image.png)" onChange={mockChange} />);

        fireEvent.click(screen.getByText('Preview'));

        // Ensure the image tag is not rendered
        const img = screen.queryByRole('img');
        expect(img).toBeNull();
    });
});