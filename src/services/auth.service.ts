export class AuthService {

    static async register(user: any): Promise<any> {
        return { _id: "123", name : "boby", ...user };
    }
    static async login(informationUser: any): Promise<string> {
        return "tokenButFake";
    }

    static async logOut(): Promise<void> {
        return;
    }
    
}
