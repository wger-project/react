import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton, InputAdornment, TextField } from "@mui/material";
import Grid from '@mui/material/Grid';
import { useFieldContext } from "@/core/forms/formContexts";
import { useNestedFieldError } from "@/core/forms/useNestedFieldError";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { randomUUID } from "@/core/lib/uuid";

/** Bound to the form field it is rendered in via form.AppField */
export function ExerciseNotes() {
    const [t] = useTranslation();
    const field = useFieldContext<string[]>();
    const notes = field.state.value;
    // The validator reports on the single notes, e.g. `notes[0]`
    const nestedError = useNestedFieldError(field);
    const error = field.state.meta.isTouched ? nestedError : undefined;
    const [newNoteValue, setNewNoteValue] = useState<string>('');
    const noteKeys = useRef<string[]>(notes.map(() => randomUUID()));

    const deleteAtIndex = (index: number) => {
        noteKeys.current.splice(index, 1);
        field.handleChange(notes.filter((_, i) => i !== index));
    };

    const setNoteValueIndex = (index: number, note: string) => {
        field.handleChange(notes.map((existing, i) => i === index ? note : existing));
    };
    const addEntry = () => {
        noteKeys.current.push(randomUUID());
        field.handleChange([...notes, newNoteValue]);
        setNewNoteValue('');
    };

    return <>
        <Grid size={12}>
            <TextField
                fullWidth
                label={t('exercises.newNote')}
                sx={{ mb: 3 }}
                variant="standard"
                value={newNoteValue}
                onChange={event => setNewNoteValue(event.target.value)}
                error={error !== undefined}
                helperText={error ?? t('exercises.notesHelpText')}
                slotProps={{
                    input: {
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={addEntry}>
                                    <AddIcon />
                                </IconButton>
                            </InputAdornment>
                        ),
                    },
                }}
            />
        </Grid>
        {notes.map((note: string, index: number) =>
            <TextField
                key={noteKeys.current[index]}
                fullWidth
                value={note}
                onChange={(event) => setNoteValueIndex(index, event.target.value)}
                sx={{ mt: 2 }}
                variant="standard"
                error={error !== undefined}
                slotProps={{
                    input: {
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={() => deleteAtIndex(index)}>
                                    <DeleteIcon />
                                </IconButton>
                            </InputAdornment>
                        ),
                    },
                }}

            />
        )}
    </>;
}
