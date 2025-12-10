import React, { useState } from 'react';
import Markdown, { MarkdownToJSX } from 'markdown-to-jsx';
import { Box, Button, TextField, Typography, Paper, ButtonGroup } from '@mui/material';

const StripElement = ({ children }: { children: React.ReactNode }) => <span>{children}</span>;

const StripBlock = ({ children }: { children: React.ReactNode }) => (
    <Typography variant="body1" component="div" sx={{ mb: 1.5 }}>
        {children}
    </Typography>
);

const MarkdownOptions: MarkdownToJSX.Options = {
    overrides: {
        p: {
            component: Typography,
            props: { variant: 'body1', sx: { mb: 1.5 } }
        },

        // Allowed inline/list tags
        strong: { component: 'strong' },
        b: { component: 'b' },
        em: { component: 'em' },
        i: { component: 'i' },
        ul: { component: 'ul', props: { style: { paddingLeft: '20px', margin: '0 0 16px 0' } } },
        ol: { component: 'ol', props: { style: { paddingLeft: '20px', margin: '0 0 16px 0' } } }, li: { component: 'li' },

        // Block links and headings by mapping them to plan spans.
        a: { component: StripElement },

        // --- BLOCKED TAGS (No headings allowed) ---
        h1: { component: StripBlock },
        h2: { component: StripBlock },
        h3: { component: StripBlock },
        h4: { component: StripBlock },
        h5: { component: StripBlock },
        h6: { component: StripBlock },        // Tables, images, etc. are naturally ignored by markdown-to-jsx if not explicitly defined

        img: { component: () => null },

        table: { component: 'div' },
    },
};

interface MarkdownEditorProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    error?: boolean;
    helperText?: string;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
    value,
    onChange,
    label = "Description",
    error,
    helperText
}) => {
    const [isPreview, setIsPreview] = useState(false);

    return (
        <Box mb={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle2" color={error ? 'error' : 'textSecondary'}>
                    {label}
                </Typography>
                <ButtonGroup size="small" variant="outlined">
                    <Button
                        variant={!isPreview ? 'contained' : 'outlined'}
                        onClick={() => setIsPreview(false)}
                    >
                        Write
                    </Button>
                    <Button
                        variant={isPreview ? 'contained' : 'outlined'}
                        onClick={() => setIsPreview(true)}
                    >
                        Preview
                    </Button>
                </ButtonGroup>
            </Box>

            {isPreview ? (
                <Paper
                    variant="outlined"
                    sx={{
                        p: 2,
                        minHeight: '100px',
                        borderColor: error ? 'error.main' : undefined,
                        backgroundColor: 'background.default'
                    }}
                >
                    {/* The library handles the parsing based on our secure options */}
                    <Markdown options={MarkdownOptions}>
                        {value || '*No content*'}
                    </Markdown>
                </Paper>
            ) : (
                <TextField
                    fullWidth
                    multiline
                    minRows={4}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    error={error}
                    helperText={helperText}
                    placeholder="Use Markdown: *italic*, **bold**, - list"
                />
            )}
        </Box>
    );
};