import { Adapter } from "utils/Adapter";

export class Profile {
    constructor(
        public username: string,
        public email: string,
        public emailVerified: boolean,
    ) {
    }
}

export class ProfileAdapter implements Adapter<Profile> {
    fromJson(item: any): Profile {
        return new Profile(
            item.username,
            item.email,
            item.email_verified
        );
    }

    toJson(item: Profile): any {
        return {
            username: item.username,
            email: item.email,
            email_verified: item.emailVerified
        };
    }
}