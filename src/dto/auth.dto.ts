export interface RegisterDTO {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
}

export interface LoginDTO {
    email: string;
    password: string;
}

export interface IUserResponse {
    email: string;
    role: "user" | "admin";
    firstName?: string;
    lastName?: string;
    profilePicture?: string;
    biography?: string;
    interest?: string;
    createdAt?: Date;
    updatedAt?: Date;
}