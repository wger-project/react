import { Profile } from "components/User/models/profile";

export const testProfileDataVerified = new Profile(
    'admin',
    'root@example.com',
    true,
    new Date("2022-04-27 17:52:38.867000+00:00"),
    true
);

export const testProfileDataNotVerified = new Profile(
    'user',
    'hi@example.com',
    false,
    new Date(2022, 3, 27, 19, 52, 38, 867),
    false
);

export const testProfileApiResponse = {
    username: 'admin',
    email: 'root@example.com',
    // eslint-disable-next-line camelcase
    email_verified: true,
    // eslint-disable-next-line camelcase
    date_joined: "2022-04-27 17:52:38.867000+00:00",
    // eslint-disable-next-line camelcase
    is_trustworthy: true
};
