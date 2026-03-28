import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { INotificationProvider } from 'src/notifications/domain/interfaces/notification-provider.interface';
import {
  NOTIFICATION_PROVIDER_INTERFACE,
  NOTIFICATION_REPOSITORY_INTERFACE,
} from 'src/notifications/domain/interfaces/service.token';
import { NOTIFICATION_QUEUE } from 'src/notifications/notification.constant';
import { NotificationJobDto } from './dtos/notification-job.dto';
import { INotificationRepository } from 'src/notifications/domain/interfaces/notification-repository.interface';

@Injectable()
@Processor(NOTIFICATION_QUEUE)
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    @Inject(NOTIFICATION_PROVIDER_INTERFACE)
    private readonly provider: INotificationProvider,

    @Inject(NOTIFICATION_REPOSITORY_INTERFACE)
    private readonly repository: INotificationRepository,
  ) {
    super();
  }

  async process(job: Job<NotificationJobDto>): Promise<void> {
    const { notificationId, recipientToken, message } = job.data;
    try {
      this.logger.log(
        `Processing job ${job.id} for notification ${notificationId}`,
      );

      await this.provider.send(recipientToken, message);
      const notification = await this.repository.findById(notificationId);
      if (notification) {
        notification.markAsSent();
        await this.repository.save(notification);
      }

      this.logger.log(`Notification ${notificationId} successfully delivered.`);
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }
}
