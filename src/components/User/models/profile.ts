import { Adapter } from "utils/Adapter";

export class Profile {
    constructor(
        public username: string,
        public email: string,
        public emailVerified: boolean,
        public dateJoined: Date,
        public isTrustworthy: boolean
    ) {
    }
}

export class ProfileAdapter implements Adapter<Profile> {
    fromJson(item: any): Profile {
        return new Profile(
            item.username,
            item.email,
            item.email_verified,
            new Date(item.date_joined),
            item.is_trustworthy
        );
    }

    toJson(item: Profile): any {
        return {
            email: item.email,
        };
    }
}