import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Length, Matches } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Nguyen Van A', description: "User's full name" })
  @IsNotEmpty({ message: 'Name is not empty' })
  name: string;

  @ApiProperty({
    example: 'nguyenvana@example.com',
    description: "User's email",
  })
  @IsNotEmpty({ message: 'Email is not empty' })
  @IsEmail({}, { message: 'Email is not valid' })
  email: string;

  @ApiProperty({ example: 'password123', description: "User's password" })
  @IsNotEmpty({ message: 'Password is not empty' })
  password: string;

  @ApiProperty({ example: '0912345678', description: "User's phone number" })
  @IsNotEmpty({ message: 'Phone is not empty' })
  @Length(10, 10, { message: 'Phone must be exactly 10 characters' })
  @Matches(/^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5]|9[0-9])[0-9]{7}$/, {
    message: 'Phone is not valid',
  })
  phone: string;

  @ApiProperty({ example: 25, description: "User's age" })
  @IsNotEmpty({ message: 'Age is not empty' })
  age: number;

  @ApiProperty({ example: 'male', description: "User's gender" })
  @IsNotEmpty({ message: 'Gender is not empty' })
  gender: string;

  @ApiProperty({
    example: '123 Main St, City, Country',
    description: "User's address",
  })
  @IsNotEmpty({ message: 'Address is not empty' })
  address: string;

  @ApiProperty({ example: 'user', description: "User's role in the system" })
  @IsNotEmpty({ message: 'Role is not empty' })
  role: string;
}
