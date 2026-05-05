import axios from "axios";
import { ExerciseImage, ImageStyle } from "@/components/Exercises/models/image";
import { postExerciseImage } from "@/services";
import { deleteExerciseImage } from "@/services/image";

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
            "style": ImageStyle.THREE_D,
            "license_title": "image",
            "license_object_url": "https://object-url.com",
            "license_author": "Test user",
            "license_author_url": "https://author-url.com",
            "license_derivative_source_url": "https://derivative-source-url.com"
        };
        const image = new ExerciseImage(
            1,
            "004bb79f-36bf-4c48-8c00-d863d724717c",
            "https://wger.de/media/exercise-images/1070/004bb79f-36bf-4c48-8c00-d863d724717c.jpg",
            true, 
            "image",
            "Test user",
            "https://author-url.com",
            "https://object-url.com",
            "https://derivative-source-url.com",
            ImageStyle.THREE_D
        );

        (axios.post as jest.Mock).mockImplementation(() => Promise.resolve({ data: response }));

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
                    style: ImageStyle.THREE_D,
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
        (axios.delete as jest.Mock).mockImplementation(() => Promise.resolve({ status: 204 }));

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
