import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { NotificationService } from 'src/notifications/applications/services/notification.service';
import { SendNotificationDto } from '../dtos/send-notification.dto';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  async sendNotification(@Body() dto: SendNotificationDto) {
    await this.notificationService.sendNotification(dto);

    return {
      status: 'accepted',
      message: 'Your notification has been sent.',
    };
  }
}
