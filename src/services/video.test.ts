import axios from "axios";
import { ExerciseVideo } from "components/Exercises/models/video";
import { deleteExerciseVideo, postExerciseVideo } from "services";

jest.mock("axios");

describe("Exercise video service API tests", () => {
    test("POST a new video", async () => {
        // Arrange
        const response = {
            id: 1,
            uuid: "b1c934fa-c4f8-4d84-8cb4-7802be0d284c",
            exercise: 258,
            exercise_uuid: "6260e3aa-e46b-4b4b-8ada-58bfd0922d3a",
            video: "http://localhost:8000/media/exercise-video/258/b1c934fa-c4f8-4d84-8cb4-7802be0d284c.mp4",
            is_main: false,
            size: 0,
            duration: "0.00",
            width: 0,
            height: 0,
            codec: "",
            codec_long: "",
            license: 2,
            license_author: null,
        };

        const video = new ExerciseVideo(
            1,
            "b1c934fa-c4f8-4d84-8cb4-7802be0d284c",
            "http://localhost:8000/media/exercise-video/258/b1c934fa-c4f8-4d84-8cb4-7802be0d284c.mp4",
            false
        );

        (axios.post as jest.Mock).mockImplementation(() => Promise.resolve({ data: response }));

        // Act
        const result = await postExerciseVideo({
            exerciseId: 42,
            author: "Prostetnic Vogon Jeltz",
            video: new File([], "test.mp4"),
        });

        // Assert
        expect(axios.post).toHaveBeenCalled();
        expect(axios.post).toHaveBeenCalledWith(
            "https://example.com/api/v2/video/",
            expect.objectContaining({ exercise: 42 }),
            expect.anything()
        );
        expect(result).toEqual(video);
    });

    test("DELETE an existing video", async () => {
        // Arrange
        (axios.delete as jest.Mock).mockImplementation(() => Promise.resolve({ status: 204 }));

        // Act
        const result = await deleteExerciseVideo(99);

        // Assert
        expect(axios.delete).toHaveBeenCalled();
        expect(axios.delete).toHaveBeenCalledWith("https://example.com/api/v2/video/99/", expect.anything());
        expect(result).toEqual(204);
    });
});
