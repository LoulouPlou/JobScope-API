
export interface IUser {
    email: string;
    password: string;
    role: "user"|"admin";

    firstName?: string;
    lastName?: string;

    profilePicture?: string;
    biography?: string;
    interest?: string;
   
}