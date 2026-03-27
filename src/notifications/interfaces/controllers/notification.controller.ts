import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseFilters,
} from '@nestjs/common';
import { SendNotificationDto } from '../dtos/send-notification.dto';
import { CommandBus } from '@nestjs/cqrs';
import { SendNotificationCommand } from 'src/notifications/applications/commands/send-notification.command';
import { AllExceptionFilter } from 'src/common/filters/all-exception.filter';

@Controller('notifications')
@UseFilters(AllExceptionFilter)
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
