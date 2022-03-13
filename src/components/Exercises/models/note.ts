import { Adapter } from "utils/Adapter";

export class Note {
    constructor(
        public id: number,
        public note: string,
    ) {
    }

}

export class NoteAdapter implements Adapter<Note> {
    fromJson(item: any): Note {
        return new Note(
            item.id,
            item.note,
        );
    }

    toJson(item: Note): any {
        return {
            id: item.id,
            name: item.note,
        };
    }
}