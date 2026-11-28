import { ConflictException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User, UserDocument } from "./schemas/user.schema";
import { Model } from "mongoose";

export type CreateUserInput = Pick<User, "email" | "password_hash"> &
  Partial<Pick<User, "role">>;

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(data: CreateUserInput): Promise<UserDocument> {
    const user = new this.userModel(data);
    try {
      return await user.save();
    } catch (err: any) {
      if (err?.code === 11000)
        throw new ConflictException("Account with this email already exists");
      throw err;
    }
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase().trim() }).exec();
  }
}
