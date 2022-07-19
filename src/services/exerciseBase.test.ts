import axios from "axios";
import { getExerciseBase, getExerciseBases, processBaseData, processBaseDataSingle } from "services/exerciseBase";
import { ExerciseBase } from "components/Exercises/models/exerciseBase";
import { Category } from "components/Exercises/models/category";
import { Equipment } from "components/Exercises/models/equipment";
import { Muscle } from "components/Exercises/models/muscle";
import { ExerciseImage } from "components/Exercises/models/image";
import { ExerciseTranslation } from "components/Exercises/models/exerciseTranslation";
import { Note } from "components/Exercises/models/note";
import { Alias } from "components/Exercises/models/alias";
import { responseApiExerciseBaseInfo } from "tests/exerciseTestdata";

jest.mock("axios");

const exerciseTranslation1 = new ExerciseTranslation(111,
    '583281c7-2362-48e7-95d5-8fd6c455e0fb',
    'Squats',
    'Do a squat',
    2,
    [
        new Note(133, 'do the exercise correctly'),
    ],
    [
        new Alias(1, 'test 123'),
        new Alias(2, 'another name'),
    ]
);
const exerciseTranslation2 = new ExerciseTranslation(9,
    'dae6f6ed-9408-4e62-a59a-1a33f4e8ab36',
    'Kniebeuge',
    'Kniebeuge machen',
    1
);
const category = new Category(10, "Abs");
const equipment1 = new Equipment(10, "Kettlebell");
const equipment2 = new Equipment(1, "Test 123");
const muscle1 = new Muscle(10, "Quadriceps femoris", "Quads", true);
const muscle2 = new Muscle(11, "Biceps femoris", "Hamstrings", false);
const image = new ExerciseImage(
    7,
    "2fe5f04b-5c9d-448c-a973-3fad6ddd4f74",
    "http://localhost:8000/media/exercise-images/9/2fe5f04b-5c9d-448c-a973-3fad6ddd4f74.jpg",
    true);

const exerciseBase1 = new ExerciseBase(
    345,
    "c788d643-150a-4ac7-97ef-84643c6419bf",
    category,
    [equipment1, equipment2],
    [muscle1],
    [muscle2],
    [image],
    228,
    [
        "This is a comment",
        "This is another comment",
        "This is a third comment"
    ],
    [
        exerciseTranslation1,
        exerciseTranslation2
    ]
);

describe("Exercise service API tests", () => {

    test('GET exercise base data entries', async () => {

        // Arrange
        // @ts-ignore
        axios.get.mockImplementation(() => Promise.resolve({ data: responseApiExerciseBaseInfo }));

        // Act
        const result = await getExerciseBases();

        // Assert
        expect(axios.get).toHaveBeenCalledTimes(1);
        expect(result).toEqual([exerciseBase1]);
    });

    test('GET exercise base data for single entry', async () => {

        // Arrange
        // @ts-ignore
        axios.get.mockImplementation(() => Promise.resolve(responseApiExerciseBaseInfo.results[0]));

        // Act
        const result = await getExerciseBase(345);

        // Assert
        expect(axios.get).toHaveBeenCalledTimes(1);
        expect(result).toEqual(exerciseBase1);
    });
});


describe("Exercise base service parser tests", () => {

    test('processBaseData', () => {

        // Act
        const result = processBaseData(responseApiExerciseBaseInfo);

        // Assert
        expect(result).toEqual([exerciseBase1]);
    });
    test('processBaseDataSingle', () => {

        // Act
        const result = processBaseDataSingle(responseApiExerciseBaseInfo.results[0]);

        // Assert
        expect(result).toEqual(exerciseBase1);
    });
});
