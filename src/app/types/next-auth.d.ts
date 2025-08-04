import { User } from "./user.interface";

declare module "next-auth" {
    interface Session {
        user: User;
    }
}