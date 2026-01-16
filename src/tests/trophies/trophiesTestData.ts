import { Trophy } from "components/Trophies/models/trophy";
import { UserTrophy } from "components/Trophies/models/userTrophy";
import { UserTrophyProgression } from "components/Trophies/models/userTrophyProgression";

export const testTrophies = () => {
    return [
        new Trophy({
            id: 123,
            type: 'other',
            isHidden: false,
            uuid: 'trophy-123',
            name: 'Beginner',
            description: 'Complete your first workout',
            image: 'https://example.com/images/beginner.png',
            isProgressive: false,
        }),
        new Trophy({
            id: 456,
            type: 'count',
            isHidden: false,
            uuid: 'trophy-456',
            name: 'Unstoppable',
            description: 'Maintain a 30-day workout streak',
            image: 'https://example.com/images/unstoppaböe.png',
            isProgressive: true,
        }),
        new Trophy({
            id: 789,
            type: 'other',
            isHidden: true,
            uuid: 'trophy-789',
            name: 'Secret Trophy',
            description: 'This is a super secret trophy',
            image: 'https://example.com/images/secret.png',
            isProgressive: false,
        })
    ];
};

export const testUserProgressionTrophies = () => {
    return [
        new UserTrophyProgression({
            trophy: testTrophies()[0],
            isEarned: true,
            earnedAt: new Date('2025-12-19T10:00:00Z'),
            progress: 100,
            currentValue: null,
            targetValue: null,
            progressDisplay: null,
        }),
        new UserTrophyProgression({
            trophy: testTrophies()[1],
            isEarned: false,
            earnedAt: new Date('2025-12-19T10:00:00Z'),
            progress: 13.333333333333334,
            currentValue: 4,
            targetValue: 30,
            progressDisplay: '4/30',
        }),
    ];
};

export const testUserTrophies = () => {
    return [
        new UserTrophy({
            id: 123,
            isNotified: true,
            trophy: testTrophies()[0],
            earnedAt: new Date('2025-12-19T10:00:00Z'),
            progress: 100,
        }),
        new UserTrophy({
            id: 456,
            isNotified: true,
            trophy: testTrophies()[1],
            earnedAt: new Date('2025-12-19T10:00:00Z'),
            progress: 100,
        }),
    ];
};