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
import { IResponse } from 'src/common/interfaces/response.interface';

@Controller('notifications')
@UseFilters(AllExceptionFilter)
export class NotificationController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  async sendNotification(
    @Body() dto: SendNotificationDto,
  ): Promise<IResponse<Record<PropertyKey, never>>> {
    await this.commandBus.execute(
      new SendNotificationCommand(dto.recipientToken, dto.message),
    );

    return {
      _data: {},
      _metadata: {
        statusCode: HttpStatus.ACCEPTED,
        message: 'Your notification has been queued for delivery.',
        success: true,
      },
    };
  }
}
