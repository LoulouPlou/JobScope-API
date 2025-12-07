export interface UpdateUserByAdminDTO {
    firstName?: string;
    lastName?: string;
    role?: 'user' | 'admin';
    profilePicture?: string;
    biography?: string;
    interest?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pages: number;
    limit: number;
}