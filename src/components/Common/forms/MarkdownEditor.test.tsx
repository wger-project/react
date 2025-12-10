import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MarkdownEditor } from './MarkdownEditor';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../i18n'; // Assuming standard i18n setup

describe('MarkdownEditor', () => {
    const mockOnChange = jest.fn();

    it('renders in write mode by default with correct label', () => {
        render(<I18nextProvider i18n={i18n}>
            <MarkdownEditor value="Test value" onChange={mockOnChange} label="Exercise Instructions" />
        </I18nextProvider>);

        // Should find the Write button and the textarea
        expect(screen.getByText('Write')).toHaveAttribute('aria-current', 'true');
        expect(screen.getByRole('textbox', { name: /exercise instructions/i })).toHaveValue('Test value');
    });

    it('toggles to preview mode and displays content', () => {
        render(<I18nextProvider i18n={i18n}>
            <MarkdownEditor value="This is **bold** text." onChange={mockOnChange} />
        </I18nextProvider>);

        // Switch to Preview
        fireEvent.click(screen.getByText('Preview'));

        // Check if the bold text is rendered (ReactMarkdown uses <strong>)
        expect(screen.getByText('bold', { selector: 'strong' })).toBeInTheDocument();

        // Should NOT render disallowed tags like headings
        const markdownInput = '# Heading\n\nSimple text';
        render(<I18nextProvider i18n={i18n}>
            <MarkdownEditor value={markdownInput} onChange={mockOnChange} />
        </I18nextProvider>);
        fireEvent.click(screen.getByText('Preview'));
        expect(screen.queryByRole('heading')).toBeNull(); // Assert H1 is not rendered
    });

    it('calls onChange handler on input change', () => {
        render(<I18nextProvider i18n={i18n}>
            <MarkdownEditor value="" onChange={mockOnChange} />
        </I18nextProvider>);

        const textarea = screen.getByRole('textbox');
        fireEvent.change(textarea, { target: { value: 'New text' } });

        expect(mockOnChange).toHaveBeenCalledWith('New text');
    });
});

// To run this test:
// npm test -- MarkdownEditor