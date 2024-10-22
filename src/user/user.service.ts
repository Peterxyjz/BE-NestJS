import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User as UserM, UserDocument } from './Schemas/user.entity';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import { IUser } from './user.interface';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserM.name)
    private userModel: SoftDeleteModel<UserDocument>,
  ) {}

  /**
   * Hashes a plain text password.
   * @param password - The plain text password to hash.
   * @returns The hashed password.
   */
  getHashPassword = (password: string) => {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash;
  };

  /**
   * Creates a new user.
   * @param createUserDto - The DTO containing user data.
   * @param user - The current user making the request.
   * @throws BadRequestException if the email already exists.
   * @returns The newly created user.
   */
  async create(createUserDto: CreateUserDto, user: IUser) {
    const { name, email, password, phone, age, gender, address, role } =
      createUserDto;
    const isExist = await this.userModel.findOne({ email });
    if (isExist) {
      throw new BadRequestException(`Email ${email} is already exist`);
    }
    const hashPassword = this.getHashPassword(password);
    const newUser = await this.userModel.create({
      name,
      email,
      password: hashPassword,
      phone,
      age,
      gender,
      address,
      role,
    });
    return newUser;
  }

  /**
   * Retrieves all users with pagination.
   * @param currentPage - The current page number.
   * @param limit - The number of items per page.
   * @param qs - Query string for filtering and sorting.
   * @returns An object containing meta information and the result set of users.
   */
  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    const offset = (+currentPage - 1) * +limit;
    const defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.userModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .select('-password')
      .populate(population)
      .exec();

    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        pages: totalPages,
        total: totalItems,
      },
      result,
    };
  }

  /**
   * Retrieves a user by their ID.
   * @param id - The ID of the user to retrieve.
   * @throws BadRequestException if the ID is invalid.
   * @returns The user object or a message if not found.
   */
  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }
    const user = await this.userModel.findById(id).select('-password');

    return user ? user : 'User not found';
  }

  /**
   * Updates a user by their ID.
   * @param id - The ID of the user to update.
   * @param updateUserDto - The DTO containing updated user data.
   * @param user - The current user making the request.
   * @throws BadRequestException if the ID is invalid or if the email is being updated.
   * @returns The result of the update operation.
   */
  async update(id: string, updateUserDto: UpdateUserDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }
    if (updateUserDto.email) {
      throw new BadRequestException('Email cannot be updated');
    }
    return await this.userModel.updateOne(
      { _id: id },
      {
        ...updateUserDto,
      },
    );
  }

  /**
   * Soft deletes a user by their ID.
   * @param id - The ID of the user to delete.
   * @returns The result of the delete operation.
   */
  async remove(id: string) {
    return await this.userModel.softDelete({ _id: id });
  }

  /**
   * Finds a user by their username.
   * @param username - The username (email) of the user.
   * @returns The user object with role populated.
   */
  findOneByUsername(username: string) {
    return this.userModel
      .findOne({
        email: username,
      })
      .populate({
        path: 'role',
        select: { name: 1 },
      });
  }

  /**
   * Validates a password against a hashed password.
   * @param password - The plain text password to validate.
   * @param hash - The hashed password to compare against.
   * @returns True if valid, otherwise false.
   */
  isValidPassword(password: string, hash: string) {
    return compareSync(password, hash);
  }
}
