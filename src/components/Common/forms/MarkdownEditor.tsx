import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Box, Button, TextField, Typography, Paper } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';

interface MarkdownEditorProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    error?: boolean;
    helperText?: string | false;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
    value,
    onChange,
    label = "Description",
    error,
    helperText
}) => {
    const [isPreview, setIsPreview] = useState(false);

    // Allowed tags for wger
    const allowedTags = ['p', 'strong', 'em', 'ul', 'ol', 'li', 'b', 'i'];

    return (
        <Box mb={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                {/* Tabs/Buttons */}
                <Box>
                    <Button
                        startIcon={<EditIcon />}
                        variant={!isPreview ? "contained" : "text"}
                        size="small"
                        onClick={() => setIsPreview(false)}
                        sx={{ mr: 1 }}
                    >
                        Write
                    </Button>
                    <Button
                        startIcon={<VisibilityIcon />}
                        variant={isPreview ? "contained" : "text"}
                        size="small"
                        onClick={() => setIsPreview(true)}
                    >
                        Preview
                    </Button>
                </Box>
            </Box>

            {isPreview ? (
                <Paper variant="outlined" sx={{ p: 2, minHeight: '150px', backgroundColor: '#f5f5f5' }}>
                    {value ? (
                        <ReactMarkdown allowedElements={allowedTags}>
                            {value}
                        </ReactMarkdown>
                    ) : (
                        <Typography variant="body2" color="textSecondary">
                            <em>Nothing to preview</em>
                        </Typography>
                    )}
                </Paper>
            ) : (
                <TextField
                    fullWidth
                    multiline
                    minRows={6}
                    label={label}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    error={error}
                    helperText={helperText || "Supported: **Bold**, *Italic*, Lists."}
                    variant="outlined"
                />
            )}
        </Box>
    );
};