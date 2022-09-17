import { RolesEnum } from "@decorators/roles.decorator";

export interface FirebaseDecodeResponse {
    uid: string;
    email?: string;
    phone_number?: string;
    sign_in_provider: string;
}