import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class NotificationJobDto {
  @IsUUID()
  @IsNotEmpty()
  notificationId: string;

  @IsString()
  @IsNotEmpty()
  recipientToken: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}
