import axios from 'axios';
import { ImageFormData } from "components/Exercises/models/exercise";
import { ExerciseImage, ExerciseImageAdapter } from "components/Exercises/models/image";
import { makeHeader, makeUrl } from "utils/url";

export const IMAGE_PATH = 'exerciseimage';


/*
 * Post a new exercise image
 */
export type PostExerciseImageParams = {
    exerciseId: number;
    image: File;
    imageData: ImageFormData;
};

export const postExerciseImage = async (data: PostExerciseImageParams): Promise<ExerciseImage> => {
    const url = makeUrl(IMAGE_PATH);
    const headers = makeHeader();
    headers['Content-Type'] = 'multipart/form-data';

    const response = await axios.post(
        url,
        {
            // eslint-disable-next-line camelcase
            exercise_base: data.exerciseId,
            image: data.image,
            // eslint-disable-next-line camelcase
            license_title: data.imageData.title,
            // eslint-disable-next-line camelcase
            license_object_url: data.imageData.objectUrl,
            // eslint-disable-next-line camelcase
            license_author: data.imageData.author,
            // eslint-disable-next-line camelcase
            license_author_url: data.imageData.authorUrl,
            // eslint-disable-next-line camelcase
            license_derivative_source_url: data.imageData.derivativeSourceUrl,
            style: data.imageData.style,
        },
        { headers: headers }
    );
    return new ExerciseImageAdapter().fromJson(response.data);
};

/*
 * Delete an exercise image
 */
export const deleteExerciseImage = async (imageId: number): Promise<number> => {
    const url = makeUrl(IMAGE_PATH, { id: imageId });
    const headers = makeHeader();
    const response = await axios.delete(url, { headers: headers });

    return response.status;
};
