import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { INotificationProvider } from 'src/notifications/domain/interfaces/notification-provider.interface';
import {
  ALERT_SERVICE_INTERFACE,
  NOTIFICATION_PROVIDER_INTERFACE,
} from 'src/notifications/domain/interfaces/service.token';
import { NOTIFICATION_QUEUE } from 'src/notifications/notification.constant';
import { NotificationJobDto } from './dtos/notification-job.dto';
import { EventBus } from '@nestjs/cqrs';
import { NotificationSentEvent } from 'src/notifications/domain/events/notification-sent.event';
import { NotificationFailedEvent } from 'src/notifications/domain/events/notification-failed.event';
import { IAlertService } from 'src/notifications/domain/interfaces/alert-service.interface';

@Injectable()
@Processor(NOTIFICATION_QUEUE)
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    @Inject(NOTIFICATION_PROVIDER_INTERFACE)
    private readonly provider: INotificationProvider,
    private readonly eventBus: EventBus,
    @Inject(ALERT_SERVICE_INTERFACE)
    private readonly alertService: IAlertService,
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
      this.eventBus.publish(new NotificationSentEvent(notificationId));

      this.logger.log(`Notification ${notificationId} successfully delivered.`);
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  @OnWorkerEvent('failed')
  async onJobFailed(job: Job<NotificationJobDto>, error: Error) {
    if (job.attemptsMade >= job.opts.attempts) {
      this.logger.error(`Failed send-notification job Error: ${error.message}`);

      this.eventBus.publish(
        new NotificationFailedEvent(job.data.notificationId),
      );

      const message = `
      🚨 <b>AuraNotify Alert: Permanent Failure</b>
      <b>Job ID:</b> ${job.id}
      <b>Notification ID:</b> ${job.data.notificationId}
      <b>Error:</b> <code>${error.message}</code>
      <b>Time:</b> ${new Date().toISOString()}
            `;
      this.alertService.sendAlert(message);
      this.logger.warn(`Alert sent for failed job ${job.id}`);
    }
  }
}
