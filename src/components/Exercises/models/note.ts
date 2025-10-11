import { Adapter } from "utils/Adapter";

export class Note {
    constructor(
        public id: number | null,
        public exercise: number,
        public note: string,
    ) {
    }
}

export class NoteAdapter implements Adapter<Note> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fromJson(item: any): Note {
        return new Note(
            item.id,
            item.exercise,
            item.comment,
        );
    }

    toJson(item: Note) {
        return {
            id: item.id,
            comment: item.note,
            exercise: item.exercise
        };
    }
}