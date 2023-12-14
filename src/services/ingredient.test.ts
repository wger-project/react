import axios from "axios";
import { getIngredient } from "services/ingredient";

jest.mock("axios");

describe("Ingrediente service tests", () => {

    test('GET an ingredient', async () => {

        // Arrange
        const ingredientInfoResponse = {
            "id": 77897,
            "uuid": "7b13e612-14e6-424a-9418-4fd366ff3224",
            "code": "8801043020756",
            "name": "some test ingredient",
            "creation_date": "2020-12-20T01:00:00+01:00",
            "update_date": "2023-04-08T02:00:00+02:00",
            "energy": 470,
            "protein": "6.000",
            "carbohydrates": "72.000",
            "carbohydrates_sugar": "4.000",
            "fat": "18.000",
            "fat_saturated": "6.000",
            "fibres": null,
            "sodium": "0.508",
            "license": 5,
            "license_title": "감자깡",
            "license_object_url": "",
            "license_author": "Open Food Facts",
            "license_author_url": "",
            "license_derivative_source_url": "",
            "language": 2,
            "image": {
                "id": 1,
                "uuid": "b260b245-efe9-4c92-9d8f-d2c4406221dd",
                "image": "http://localhost:8000/media/ingredients/59197/b260b245-efe9-4c92-9d8f-d2c4406221dd.jpg",
                "created": "2023-08-10T14:02:50.819376+02:00",
                "last_update": "2023-08-10T14:02:50.832422+02:00",
                "size": 21159,
                "width": 400,
                "height": 194,
                "license": 1,
                "license_title": "Photo",
                "license_object_url": "https://world.openfoodfacts.org/cgi/product_image.pl?code=4250241203517&id=2",
                "license_author": "kiliweb",
                "license_author_url": "https://world.openfoodfacts.org/photographer/kiliweb",
                "license_derivative_source_url": ""
            }
        };

        // Act
        // @ts-ignore
        axios.get.mockImplementation(() => Promise.resolve({ data: ingredientInfoResponse }));
        const result = await getIngredient(1);

        // Assert
        expect(axios.get).toHaveBeenCalledTimes(1);
        expect(result.id).toEqual(77897);
        expect(result.uuid).toEqual("7b13e612-14e6-424a-9418-4fd366ff3224");
        expect(result.code).toEqual("8801043020756");
        expect(result.name).toEqual("some test ingredient");
        expect(result.energy).toEqual(470);
        expect(result.protein).toEqual(6);
        expect(result.carbohydrates).toEqual(72);
        expect(result.carbohydratesSugar).toEqual(4);
        expect(result.fat).toEqual(18);
        expect(result.fatSaturated).toEqual(6);
        expect(result.fibres).toEqual(null);
        expect(result.sodium).toEqual(0.508);
        expect(result.image?.url).toEqual('http://localhost:8000/media/ingredients/59197/b260b245-efe9-4c92-9d8f-d2c4406221dd.jpg');

    });
});


