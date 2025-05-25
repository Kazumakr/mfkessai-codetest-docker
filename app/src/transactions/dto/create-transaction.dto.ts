import { IsNumber, IsNotEmpty, IsString } from 'class-validator';

export class CreateTransactionDto {
    @IsNotEmpty()
    @IsNumber()
    user_id: number;

    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @IsNotEmpty()
    @IsString()
    description: string;
}
