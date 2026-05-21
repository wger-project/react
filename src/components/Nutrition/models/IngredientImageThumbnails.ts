import { Adapter } from "@/core/lib/Adapter";

export type ApiIngredientThumbnailType = {
    small: string,
    medium: string
}

export type IngredientImageThumbnailsConstructorParams = {
    small: string;
    medium: string;
};

/**
 * Note: all the strings are URLs to the images
 */
export class IngredientImageThumbnails {
    public small: string;
    public medium: string;

    constructor(params: IngredientImageThumbnailsConstructorParams) {
        this.small = params.small;
        this.medium = params.medium;
    }

    static fromJson(json: ApiIngredientThumbnailType): IngredientImageThumbnails {
        return adapter.fromJson(json);
    }
}

class IngredientImageThumbnailsAdapter implements Adapter<IngredientImageThumbnails> {
    fromJson(item: ApiIngredientThumbnailType): IngredientImageThumbnails {
        return new IngredientImageThumbnails({
            small: item.small,
            medium: item.medium,
        });
    }
}

const adapter = new IngredientImageThumbnailsAdapter();
