import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { ResponseMessage, User } from '../decorator/customize';
import { IUser } from './user.interface';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ResponseMessage('User created successfully')
  @Post()
  create(@Body() createUserDto: CreateUserDto, @User() user: IUser) {
    return this.userService.create(createUserDto, user);
  }

  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiQuery({
    name: 'current',
    required: true,
    description: 'Current page number',
  })
  @ApiQuery({
    name: 'pageSize',
    required: true,
    description: 'Number of items per page',
  })
  @ApiResponse({ status: 200, description: 'Fetch user with paginate' })
  @ApiResponse({ status: 400, description: 'Invalid query parameters' })
  @ResponseMessage('Fetch user with paginate')
  @Get()
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') pageSize: string,
    @Query() qs: string,
  ) {
    return this.userService.findAll(+currentPage, +pageSize, qs);
  }

  @ApiOperation({ summary: 'Get user by id' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Fetch user by id' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ResponseMessage('Fetch user by id')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @ApiOperation({ summary: 'Update user by id' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Update user by id' })
  @ApiResponse({ status: 400, description: 'Invalid update data' })
  @ResponseMessage('Update user by id')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @User() user: IUser,
  ) {
    return this.userService.update(id, updateUserDto, user);
  }

  @ApiOperation({ summary: 'Delete user by id' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Delete user by id' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ResponseMessage('Delete user by id')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
