import { Adapter } from "utils/Adapter";

export class ExerciseVideo {

    constructor(
        public id: number,
        public uuid: string,
        public url: string,
        public isMain: boolean) {
    }
}

export class ExerciseVideoAdapter implements Adapter<ExerciseVideo> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fromJson(item: any): ExerciseVideo {
        return new ExerciseVideo(
            item.id,
            item.uuid,
            item.video,
            item.is_main
        );
    }

    toJson(item: ExerciseVideo) {
        return {
            id: item.id,
            video: item.url,
        };
    }
}