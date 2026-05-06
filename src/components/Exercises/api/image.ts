import axios from 'axios';
import { ImageFormData } from "@/components/Exercises/models/exercise";
import { ExerciseImage, ExerciseImageAdapter } from "@/components/Exercises/models/image";
import { makeHeader, makeUrl } from "@/core/lib/url";

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
            exercise: data.exerciseId,
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

export type PatchExerciseImageParams = {
    imageId: number;
    image?: File; // Optional: only send if the user selected a NEW file
    imageData: ImageFormData;
};

/**
 * Edit an existing exercise image
 */
export const patchExerciseImage = async (data: PatchExerciseImageParams): Promise<ExerciseImage> => {
    const url = makeUrl(IMAGE_PATH, { id: data.imageId });
    const headers = makeHeader();
    headers['Content-Type'] = 'multipart/form-data';
    
    const formData = new FormData();
    
    // ONLY append if the file exists AND has content (size > 0)
    // If we are editing existing metadata, we don't send the 'image' key at all
    if (data.image && data.image.size > 0) {
        formData.append('image', data.image);
    }

    // Always append the metadata
    formData.append('license_title', data.imageData.title);
    formData.append('license_object_url', data.imageData.objectUrl);
    formData.append('license_author', data.imageData.author);
    formData.append('license_author_url', data.imageData.authorUrl);
    formData.append('license_derivative_source_url', data.imageData.derivativeSourceUrl);
    formData.append('style', data.imageData.style);
    
    try {
        const response = await axios.patch(url, formData, { headers });
        return new ExerciseImageAdapter().fromJson(response.data);
    } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error(error.response?.status, error.response?.data);
        }
        throw error;
    }
};