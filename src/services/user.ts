import * as bcrypt from 'bcrypt';
import User from '../database/models/User';
import JWT from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export interface CreateUserPayload {
    firstName: string
    lastName?: string
    email: string
    password: string
}
export interface UserTokenPayload {
    email: string
    password: string
}
class UserService {
    private static async hashPassword(password: string): Promise<string> {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    }
    public static async createUser(payload: CreateUserPayload) {
        const { firstName, lastName, email, password } = payload;
        let errors: any = {};
        try {
            ///Validate input Data
            if (email.trim() === '') errors.email = "Email must not be empty";
            if (password.trim() === '') errors.email = "Password must not be empty";
            if (firstName.trim() === '') errors.email = "FirstName must not be empty";

            if (Object.keys(errors).length > 0)
                throw new Error("Invalid Data Error")
            ///Check if user aready exists
            const userByEmail = await User.findOne({
                where: {
                    email
                }, raw: true
            })
            if (userByEmail) errors.email = "Email already Taken";

            ///Throw an error
            if (Object.keys(errors).length > 0)
                throw new Error("Duplicate Data Error")
            ///Hash Password
            const hash = await UserService.hashPassword(password);

            ///Create User
            const newUser = await User.create({
                first_name: firstName,
                last_name: lastName,
                email,
                password: hash
            })
            return newUser;
        } catch (error) {
            throw error;
        }
    }
    public static async generateUserToken(payload: UserTokenPayload) {
        const { email, password } = payload;
        let errors: any = {};
        try {
            if (email.trim() === '') errors.email = "Email must not be empty";
            if (password.trim() === '') errors.email = "Password must not be empty";

            if (Object.keys(errors).length > 0)
                throw new Error("Invalid Data Error")
            const user = await User.findOne({
                attributes: ["id", "password"],
                where: { email },
                raw: true
            })
            if (!user) throw new Error("Invalid Email.User doesn't Exist!!!")
            let matchPassword = await bcrypt.compare(password, user.password);
            if (!matchPassword) throw new Error("Incorrect Password");
            let SecretKey = String(process.env.JWT_SECRET);
            const newToken = JWT.sign({ id: user?.id, email }, SecretKey);
            return newToken;
        } catch (error) {
            throw error;
        }
    }
    public static async decodeToken(token: string) {
        return JWT.verify(token, process.env.JWT_SECRET as string)
    }
    public static async getAllUsers() {
        let errors: any = {};
        try {
            const users = await User.findAll({})
            return users;
        } catch (error) {
            throw error;
        }
    }
}
export default UserService;