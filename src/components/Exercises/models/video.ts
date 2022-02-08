import { Adapter } from "utils/Adapter";

export class ExerciseImage {

    constructor(
        public id: number,
        public uuid: string,
        public url: string,
        public isMain: boolean) {
    }
}

export class ExerciseImageAdapter implements Adapter<ExerciseImage> {
    fromJson(item: any): ExerciseImage {
        return new ExerciseImage(
            item.id,
            item.uuid,
            item.video,
            item.is_main
        );
    }

    toJson(item: ExerciseImage): any {
        return {
            id: item.id,
            video: item.url,
            is_front: item.isMain
        };
    }
}