import { UserTrophy } from "components/Trophies/models/userTrophy";


describe('Test the user UserTrophy model', () => {

    test('correctly creates an object from the API response', () => {
        // Arrange
        const apiResponse = {
            id: 4,
            trophy: {
                id: 9,
                uuid: "32bb12da-b25f-4e18-81e4-b695eb65283e",
                name: "Phoenix",
                description: "Return to training after being inactive for 30 days",
                image: "http://localhost:8000/static/trophies/other/32bb12da-b25f-4e18-81e4-b695eb65283e.png",
                "trophy_type": "other",
                "is_hidden": true,
                "is_progressive": false,
                order: 9
            },
            "earned_at": "2025-12-19T13:48:07.519497+01:00",
            progress: 100.0,
            "is_notified": false
        };

        // Act
        const userTrophy = UserTrophy.fromJson(apiResponse);

        // Assert
        expect(userTrophy.id).toBe(4);
        expect(userTrophy.earnedAt).toStrictEqual(new Date("2025-12-19T13:48:07.519497+01:00"));
        expect(userTrophy.progress).toBe(100.0);
        expect(userTrophy.isNotified).toBe(false);

        expect(userTrophy.trophy.uuid).toBe("32bb12da-b25f-4e18-81e4-b695eb65283e");

    });
});
