import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { SendNotificationDto } from '../dtos/send-notification.dto';
import { CommandBus } from '@nestjs/cqrs';
import { SendNotificationCommand } from 'src/notifications/applications/commands/send-notification.command';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  async sendNotification(@Body() dto: SendNotificationDto) {
    await this.commandBus.execute(
      new SendNotificationCommand(dto.recipientToken, dto.message),
    );

    return {
      status: 'accepted',
      message: 'Your notification has been sent.',
    };
  }
}
