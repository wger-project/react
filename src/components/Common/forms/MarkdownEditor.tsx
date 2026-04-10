import { Box, Button, ButtonGroup, Paper, TextField, Typography } from '@mui/material';
import Markdown from 'markdown-to-jsx';
import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import { MarkdownOptions } from "utils/markdown";


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
    const [t] = useTranslation();

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
                        {t('edit')}
                    </Button>
                    <Button
                        variant={isPreview ? 'contained' : 'outlined'}
                        onClick={() => setIsPreview(true)}
                    >
                        {t('preview')}
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
                    placeholder={t('useMarkdownHint')}
                />
            )}
        </Box>
    );
};