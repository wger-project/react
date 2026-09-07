import { PaddingBox } from "@/components/Exercises/widgets/PaddingBox";
import { Note } from "@/components/Exercises/models/note";
import { Translation } from "@/components/Exercises/models/translation";
import { useAddNoteQuery, useDeleteNoteQuery, useEditNoteQuery } from "@/components/Exercises/queries";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import { IconButton, InputAdornment, TextField, Typography } from "@mui/material";
import Grid from '@mui/material/Grid';
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

/**
 * The notes of a translation next to the English ones: each note saves on
 * its own, so this is a list of small editors, not part of the form around it.
 */
export const TranslationNotes = ({ exerciseId, translation, englishNotes }: {
    exerciseId: number,
    translation: Translation,
    englishNotes: Note[],
}) => {
    const [t] = useTranslation();

    const addNoteMutation = useAddNoteQuery(exerciseId);
    const editNoteMutation = useEditNoteQuery(exerciseId);
    const deleteNoteMutation = useDeleteNoteQuery(exerciseId);

    const [newNoteValue, setNewNoteValue] = useState('');
    const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
    const [editingNoteValue, setEditingNoteValue] = useState('');

    return <>
        <Grid size={12}>
            <PaddingBox />
        </Grid>

        <Grid size={12}>
            <Typography variant={'h6'}>{t('exercises.notes')}</Typography>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
            <ul>
                {englishNotes.map((note: Note) => (
                    <li key={note.id}>{note.note}</li>
                ))}
            </ul>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
            {translation.notes.map((note: Note) => (
                <TextField
                    key={note.id}
                    fullWidth
                    value={editingNoteId === note.id ? editingNoteValue : note.note}
                    onChange={(e) => {
                        if (editingNoteId !== note.id) {
                            setEditingNoteId(note.id);
                            setEditingNoteValue(e.target.value);
                        } else {
                            setEditingNoteValue(e.target.value);
                        }
                    }}
                    onFocus={() => {
                        if (editingNoteId !== note.id) {
                            setEditingNoteId(note.id);
                            setEditingNoteValue(note.note);
                        }
                    }}
                    sx={{ mb: 1 }}
                    variant="standard"
                    slotProps={{
                        input: {
                            endAdornment: (
                                <InputAdornment position="end">
                                    {editingNoteId === note.id && editingNoteValue !== note.note && (
                                        <IconButton
                                            onClick={async () => {
                                                await editNoteMutation.mutateAsync(
                                                    new Note(note.id, note.translation, editingNoteValue)
                                                );
                                                setEditingNoteId(null);
                                                setEditingNoteValue('');
                                            }}
                                            disabled={editNoteMutation.isPending}
                                        >
                                            <SaveIcon />
                                        </IconButton>
                                    )}
                                    <IconButton
                                        onClick={() => deleteNoteMutation.mutate(note.id!)}
                                        disabled={deleteNoteMutation.isPending}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }
                    }}
                />
            ))}
            {translation.id && (
                <TextField
                    fullWidth
                    label={t('exercises.newNote')}
                    variant="standard"
                    value={newNoteValue}
                    onChange={(e) => setNewNoteValue(e.target.value)}
                    helperText={t('exercises.notesHelpText')}
                    slotProps={{
                        input: {
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={async () => {
                                            if (newNoteValue.trim()) {
                                                await addNoteMutation.mutateAsync(
                                                    new Note(null, translation.id!, newNoteValue)
                                                );
                                                setNewNoteValue('');
                                            }
                                        }}
                                        disabled={addNoteMutation.isPending || !newNoteValue.trim()}
                                    >
                                        <AddIcon />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }
                    }}
                />
            )}
        </Grid>
    </>;
};
