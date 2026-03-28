import { Adapter } from "utils/Adapter";

export enum ImageStyle {
    LINE_ART = 1,
    THREE_D,
    LOW_POLY,
    PHOTO,
    OTHER,
}

export class ExerciseImage {

    constructor(
        public id: number,
        public uuid: string,
        public url: string,
        public isMain: boolean,

        public title?: string,
        public author?: string,
        public authorUrl?: string,
        public objectUrl?: string,
        public derivativeSourceUrl?: string,
        public style?: number
    ) {}
}

export class ExerciseImageAdapter implements Adapter<ExerciseImage> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fromJson(item: any): ExerciseImage {
        return new ExerciseImage(
            item.id,
            item.uuid,
            item.image,
            item.is_main,
            item.license_title,
            item.license_author,
            item.license_author_url,
            item.license_object_url,
            item.license_derivative_source_url,
            item.style,
        );
    }

    // TODO: when uploading an image we have to send the file
    toJson(item: ExerciseImage) {
        return {
            id: item.id,
            image: item.url,
            // eslint-disable-next-line camelcase
            is_front: item.isMain
        };
    }
}