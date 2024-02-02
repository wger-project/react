import axios from 'axios';
import { ImageFormData } from "components/Exercises/models/exercise";
import { ExerciseImage, ExerciseImageAdapter } from "components/Exercises/models/image";
import { makeHeader, makeUrl } from "utils/url";

export const IMAGE_PATH = 'exerciseimage';


/*
 * Post a new exercise image
 */
export const postExerciseImage = async (
    data: {
        exerciseId: number,
        image: File,
        imageData: ImageFormData
    },
): Promise<ExerciseImage> => {
    const url = makeUrl(IMAGE_PATH);
    const headers = makeHeader();
    headers['Content-Type'] = 'multipart/form-data';

    const response = await axios.post(
        url,
        // eslint-disable-next-line camelcase
        {
            exercise_base: data.exerciseId,
            image: data.image,

            license_title: data.imageData.title,
            license_object_url: data.imageData.objectUrl,
            license_author: data.imageData.author,
            license_author_url: data.imageData.authorUrl,
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
