import { Trophy } from "components/Trophies/models/trophy";


describe('Test the trophy model', () => {

    test('correctly creates an object from the API response', () => {
        // Arrange
        const apiResponse = {
            id: 1,
            uuid: "5362e55b-eaf1-4e34-9ef8-661538a3bdd9",
            name: "Beginner",
            description: "Complete your first workout",
            image: "http://localhost:8000/static/trophies/count/5362e55b-eaf1-4e34-9ef8-661538a3bdd9.png",
            "trophy_type": "count",
            "is_hidden": false,
            "is_progressive": false,
            order: 1
        };

        // Act
        const trophy = Trophy.fromJson(apiResponse);

        // Assert
        expect(trophy.id).toBe(1);
        expect(trophy.uuid).toBe("5362e55b-eaf1-4e34-9ef8-661538a3bdd9");
        expect(trophy.name).toBe("Beginner");
        expect(trophy.description).toBe("Complete your first workout");
        expect(trophy.image).toBe("http://localhost:8000/static/trophies/count/5362e55b-eaf1-4e34-9ef8-661538a3bdd9.png");
        expect(trophy.type).toBe("count");
        expect(trophy.isHidden).toBe(false);
        expect(trophy.isProgressive).toBe(false);
    });
});
