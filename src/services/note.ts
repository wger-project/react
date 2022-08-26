import { makeHeader, makeUrl } from "utils/url";
import axios from "axios";
import { Note, NoteAdapter } from "components/Exercises/models/note";

export const API_NOTE_PATH = 'exercisecomment';


/*
 * Create a new note
 */
export const addNote = async (note: Note): Promise<Note> => {
    const adapter = new NoteAdapter();
    const url = makeUrl(API_NOTE_PATH);
    const response = await axios.post(
        url,
        adapter.toJson(note),
        { headers: makeHeader() }
    );

    return adapter.fromJson(response.data);
};

/*
 * Edit an existing note
 */
export const editNote = async (note: Note): Promise<Note> => {
    const adapter = new NoteAdapter();

    const url = makeUrl(API_NOTE_PATH, { id: note.id! });
    const response = await axios.patch(
        url,
        adapter.toJson(note),
        { headers: makeHeader() }
    );

    return adapter.fromJson(response.data);
};


