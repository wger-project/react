import axios from "axios";
import { ExerciseImage } from "components/Exercises/models/image";
import { postExerciseImage } from "services";
import { deleteExerciseImage } from "services/image";

jest.mock("axios");


describe("Image service API tests", () => {


    test('POST a new exercise image', async () => {

        // Arrange
        const response = {
            "id": 1,
            "uuid": "004bb79f-36bf-4c48-8c00-d863d724717c",
            "exercise": 101,
            "image": "https://wger.de/media/exercise-images/1070/004bb79f-36bf-4c48-8c00-d863d724717c.jpg",
            "is_main": true,
            "status": "1",
            "style": "4"
        };
        const image = new ExerciseImage(
            1,
            "004bb79f-36bf-4c48-8c00-d863d724717c",
            "https://wger.de/media/exercise-images/1070/004bb79f-36bf-4c48-8c00-d863d724717c.jpg",
            true
        );

        // @ts-ignore
        axios.post.mockImplementation(() => Promise.resolve({ data: response }));

        // Act
        const result = await postExerciseImage(
            {
                exerciseId: 101,
                image: new File([], "test.jpg"),
                imageData: {
                    url: "http://example.com",
                    file: new File([], "test.jpg"),
                    author: "Dr No",
                    authorUrl: "http://dr.no",
                    title: "top title",
                    objectUrl: "",
                    derivativeSourceUrl: "",
                    style: "3d",
                }
            }
        );

        // Assert
        expect(axios.post).toHaveBeenCalled();
        expect(axios.post).toHaveBeenCalledWith(
            'https://example.com/api/v2/exerciseimage/',
            expect.objectContaining({ "exercise": 101 }),
            expect.anything()
        );
        expect(result).toEqual(image);
    });

    test('DELETE an existing image', async () => {

        // Arrange
        // @ts-ignore
        axios.delete.mockImplementation(() => Promise.resolve({ status: 204 }));

        // Act
        const result = await deleteExerciseImage(101);

        // Assert
        expect(axios.delete).toHaveBeenCalled();
        expect(axios.delete).toHaveBeenCalledWith(
            'https://example.com/api/v2/exerciseimage/101/',
            expect.anything()
        );
        expect(result).toEqual(204);
    });
});
