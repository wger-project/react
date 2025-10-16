import { Adapter } from "utils/Adapter";

export type ApiIngredientThumbnailType = {
    small: string,
    small_cropped: string,
    medium: string,
    medium_cropped: string,
    large: string,
    large_cropped: string
}

export type IngredientImageThumbnailsConstructorParams = {
    small: string;
    smallCropped: string;
    medium: string;
    mediumCropped: string;
    large: string;
    largeCropped: string;
};

/**
 * Note: all the strings are URLs to the images
 */
export class IngredientImageThumbnails {
    public small: string;
    public smallCropped: string;
    public medium: string;
    public mediumCropped: string;
    public large: string;
    public largeCropped: string;

    constructor(params: IngredientImageThumbnailsConstructorParams) {
        this.small = params.small;
        this.smallCropped = params.smallCropped;
        this.medium = params.medium;
        this.mediumCropped = params.mediumCropped;
        this.large = params.large;
        this.largeCropped = params.largeCropped;
    }

    static fromJson(json: ApiIngredientThumbnailType): IngredientImageThumbnails {
        return adapter.fromJson(json);
    }
}

class IngredientImageThumbnailsAdapter implements Adapter<IngredientImageThumbnails> {
    fromJson(item: ApiIngredientThumbnailType): IngredientImageThumbnails {
        return new IngredientImageThumbnails({
            small: item.small,
            smallCropped: item.small_cropped,
            medium: item.medium,
            mediumCropped: item.medium_cropped,
            large: item.large,
            largeCropped: item.large_cropped,
        });
    }
}

const adapter = new IngredientImageThumbnailsAdapter();