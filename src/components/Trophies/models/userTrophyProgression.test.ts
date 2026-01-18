import { trophyType } from "components/Trophies/models/trophy";
import { UserTrophyProgression } from "components/Trophies/models/userTrophyProgression";


describe('Test the UserTrophyProgression model', () => {

    test('correctly creates an object from the API response', () => {
        // Arrange
        const apiResponse = {
            trophy: {
                id: 1,
                uuid: "5362e55b-eaf1-4e34-9ef8-661538a3bdd9",
                name: "Beginner",
                description: "Complete your first workout",
                image: "http://localhost:8000/static/trophies/count/5362e55b-eaf1-4e34-9ef8-661538a3bdd9.png",
                "trophy_type": "count" as trophyType,
                "is_hidden": false,
                "is_progressive": false,
                order: 1
            },
            "is_earned": true,
            "earned_at": "2025-12-19T13:48:07.513138+01:00",
            progress: 100.0,
            "current_value": null,
            "target_value": null,
            "progress_display": null
        };

        // Act
        const userTrophyProgression = UserTrophyProgression.fromJson(apiResponse);

        // Assert
        expect(userTrophyProgression.isEarned).toBe(true);
        expect(userTrophyProgression.earnedAt).toStrictEqual(new Date("2025-12-19T13:48:07.513138+01:00"));
        expect(userTrophyProgression.progress).toBe(100.0);
        expect(userTrophyProgression.currentValue).toBe(null);
        expect(userTrophyProgression.targetValue).toBe(null);
        expect(userTrophyProgression.progressDisplay).toBe(null);

        expect(userTrophyProgression.trophy.uuid).toBe("5362e55b-eaf1-4e34-9ef8-661538a3bdd9");

    });
});
