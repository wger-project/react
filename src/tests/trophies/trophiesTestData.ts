import { Trophy } from "@/components/Trophies/models/trophy";
import { UserTrophy } from "@/components/Trophies/models/userTrophy";
import { UserTrophyProgression } from "@/components/Trophies/models/userTrophyProgression";

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
            image: 'https://example.com/images/unstoppable.png',
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


/* eslint-disable camelcase */

// Raw API trophy entries (snake_case) used by paginated /trophy/ responses.
const trophyApiBeginner = {
    id: 123,
    uuid: "trophy-123",
    name: "Beginner",
    description: "Complete your first workout",
    image: "https://example.com/images/beginner.png",
    trophy_type: "other",
    is_hidden: false,
    is_progressive: false,
};

const trophyApiUnstoppable = {
    id: 456,
    uuid: "trophy-456",
    name: "Unstoppable",
    description: "30-day streak",
    image: "https://example.com/images/unstoppable.png",
    trophy_type: "count",
    is_hidden: false,
    is_progressive: true,
};

const trophyApiSecret = {
    id: 789,
    uuid: "trophy-789",
    name: "Secret",
    description: "secret",
    image: "https://example.com/images/secret.png",
    trophy_type: "other",
    is_hidden: true,
    is_progressive: false,
};

// Two-page paginated response for GET /trophy/?limit=...
export const responseTrophiesPage1 = {
    count: 3,
    next: "https://example.com/page2",
    previous: null,
    results: [trophyApiBeginner, trophyApiUnstoppable],
};

export const responseTrophiesPage2 = {
    count: 3,
    next: null,
    previous: null,
    results: [trophyApiSecret],
};

// Single-page paginated response for GET /user-trophy/?limit=...
export const responseUserTrophies = {
    count: 1,
    next: null,
    previous: null,
    results: [
        {
            id: 1,
            trophy: trophyApiBeginner,
            earned_at: "2025-12-19T10:00:00Z",
            progress: 100,
            is_notified: false,
        },
    ],
};

// GET /trophy/progress/ - returns an array (not paginated). One earned and one
// in-progress entry to exercise both branches of the adapter.
export const responseUserTrophyProgression = [
    {
        trophy: trophyApiBeginner,
        earned_at: "2025-12-19T10:00:00Z",
        is_earned: true,
        progress: 100,
        current_value: null,
        target_value: null,
        progress_display: null,
    },
    {
        trophy: trophyApiUnstoppable,
        earned_at: null,
        is_earned: false,
        progress: 13.33,
        current_value: 4,
        target_value: 30,
        progress_display: "4/30",
    },
];

/* eslint-enable camelcase */