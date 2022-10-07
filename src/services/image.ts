import axios from 'axios';
import { makeHeader, makeUrl } from "utils/url";
import { ExerciseImage, ExerciseImageAdapter } from "components/Exercises/models/image";

export const IMAGE_PATH = 'exerciseimage';


/*
 * Post a new exercise image
 */
export const postExerciseImage = async (exerciseBase: number, author: string, image: File): Promise<ExerciseImage> => {
    const url = makeUrl(IMAGE_PATH);
    const headers = makeHeader();
    headers['Content-Type'] = 'multipart/form-data';

    const response = await axios.post(
        url,
        // eslint-disable-next-line camelcase
        { exercise_base: exerciseBase, license_author: author, image: image },
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
