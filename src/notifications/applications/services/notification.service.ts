import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Notification } from 'src/notifications/domain/entities/notification.entity';
import { INotificationProvider } from 'src/notifications/domain/interfaces/notification-provider.interface';
import { INotificationRepository } from 'src/notifications/domain/interfaces/notification-repository.interface';
import {
  NOTIFICATION_PROVIDER_INTERFACE,
  NOTIFICATION_REPOSITORY_INTERFACE,
} from 'src/notifications/domain/interfaces/service.token';
import { SendNotificationDto } from 'src/notifications/interfaces/dtos/send-notification.dto';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @Inject(NOTIFICATION_PROVIDER_INTERFACE)
    private readonly provider: INotificationProvider,
    @Inject(NOTIFICATION_REPOSITORY_INTERFACE)
    private readonly repository: INotificationRepository,
  ) {}

  async sendNotification(dto: SendNotificationDto) {
    const notification = new Notification(
      randomUUID(),
      dto.recipientToken,
      dto.message,
    );

    try {
      await this.provider.send(
        notification.recipientToken,
        notification.content,
      );
      notification.markAsSent();
      await this.repository.save(notification);
    } catch (err) {
      notification.markAsFailed();
      await this.repository.save(notification);
      this.logger.error(err);
      throw new InternalServerErrorException(
        `Failed to send notification: ${err?.message}`,
      );
    }
  }
}
