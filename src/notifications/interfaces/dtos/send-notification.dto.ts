import { IsNotEmpty, IsString } from 'class-validator';

export class SendNotificationDto {
  @IsString()
  @IsNotEmpty()
  recipientToken: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}
