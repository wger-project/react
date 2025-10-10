import axios from 'axios';
import { ExerciseVideo, ExerciseVideoAdapter } from "components/Exercises/models/video";
import { makeHeader, makeUrl } from "utils/url";

export const VIDEO_PATH = 'video';

export type PostExerciseVideoParams = {
    exerciseId: number;
    author: string;
    video: File;
};

/**
 * Post a new exercise video
 * @param {number} exerciseId - ID of the exercise to which the video is linked
 * @param {string} author - Name of the video's author (for license attribution)
 * @param {File} video - Video file to upload
 * @returns {Promise<ExerciseVideo>} - A promise that resolves to the uploaded ExerciseVideo object
 */
export const postExerciseVideo = async ({
    exerciseId,
    author,
    video,
}: PostExerciseVideoParams): Promise<ExerciseVideo> => {
    const url = makeUrl(VIDEO_PATH);
    const headers = makeHeader();
    headers['Content-Type'] = 'multipart/form-data';

    const response = await axios.post(
        url,
        // eslint-disable-next-line camelcase
        { exercise: exerciseId, license_author: author, video: video },
        { headers: headers }
    );
    return new ExerciseVideoAdapter().fromJson(response.data);
};

/*
 * Delete an exercise video
 */
export const deleteExerciseVideo = async (videoId: number): Promise<number> => {
    const url = makeUrl(VIDEO_PATH, { id: videoId });
    const headers = makeHeader();
    const response = await axios.delete(url, { headers: headers });

    return response.status;
};
