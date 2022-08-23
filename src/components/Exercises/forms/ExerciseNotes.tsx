import { useTranslation } from "react-i18next";
import { Grid, IconButton, InputAdornment, TextField } from "@mui/material";
import React, { useState } from "react";
import { useField } from "formik";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

export function ExerciseNotes(props: { fieldName: string }) {
    const [t] = useTranslation();
    const [field, meta, helpers] = useField(props.fieldName);
    const [newNoteValue, setNewNoteValue] = useState<string>('');

    const deleteAtIndex = (index: number) => {
        helpers.setValue(field.value.filter((_: string, b: number) => b !== index));
    };

    const setNoteValueIndex = (index: number, note: string) => {
        field.value[index] = note;
        helpers.setValue(field.value);
    };
    const addEntry = () => {
        field.value.push(newNoteValue);
        helpers.setValue(field.value);
        setNewNoteValue('');
    };

    return <>
        <Grid item xs={12}>
            <TextField
                fullWidth
                label={t('exercises.newNote')}
                sx={{ mb: 3 }}
                variant="standard"
                value={newNoteValue}
                onChange={event => setNewNoteValue(event.target.value)}
                error={meta.touched && Boolean(meta.error)}
                helperText={meta.touched && meta.error ? meta.error : t('exercises.notesHelpText')}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton onClick={addEntry}>
                                <AddIcon />
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />
        </Grid>
        {field.value.map((note: string, index: number) =>
            <TextField
                key={index}
                fullWidth
                value={note}
                onChange={(event) => setNoteValueIndex(index, event.target.value)}
                sx={{ mt: 2 }}
                variant="standard"
                error={meta.touched && Boolean(meta.error)}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton onClick={() => deleteAtIndex(index)}>
                                <DeleteIcon />
                            </IconButton>
                        </InputAdornment>
                    ),
                }}

            />
        )}
    </>;
}