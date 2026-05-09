import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { Box, Stack, Typography } from "@mui/material";
import { ImageFormData } from "@/components/Exercises/models/exercise";
import { useFormikContext } from "formik";
import * as React from 'react';
import { useTranslation } from "react-i18next";

export function ImageDropZone() {
    const [t] = useTranslation();
    const { values, setFieldValue } = useFormikContext<ImageFormData>();
    const [isDragOver, setIsDragOver] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleFile = (file: File) => {
        if (!file.type.startsWith('image/')) {
            return;
        }
        setFieldValue('file', file);
        setFieldValue('url', URL.createObjectURL(file));
    };

    const handleDrop = (e: React.DragEvent<HTMLElement>) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFile(file);
        }
    };

    return (
        <Box
            onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            data-testid="image-dropzone"
            sx={{
                position: 'relative',
                border: '2px dashed',
                borderColor: isDragOver ? 'primary.main' : 'divider',
                borderRadius: 1,
                cursor: 'pointer',
                aspectRatio: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                bgcolor: isDragOver ? 'action.hover' : 'transparent',
                // Visible children must not capture drag events; they would cause flicker.
                // The hidden file input is excluded so it remains clickable via the input ref.
                '& > *:not(input)': { pointerEvents: 'none' },
            }}
        >
            {values.url ? (
                <img
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    src={values.url}
                    alt="Preview"
                />
            ) : (
                <Stack spacing={1} sx={{ alignItems: 'center', px: 1, textAlign: 'center' }}>
                    <AddPhotoAlternateIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                        {t('exercises.dropOrClickImage')}
                    </Typography>
                </Stack>
            )}
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                data-testid="image-dropzone-input"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                        handleFile(file);
                    }
                    e.target.value = '';
                }}
            />
        </Box>
    );
}
