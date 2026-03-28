import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { SendNotificationCommand } from './send-notification.command';
import { NOTIFICATION_REPOSITORY_INTERFACE } from 'src/notifications/domain/interfaces/service.token';
import { INotificationRepository } from 'src/notifications/domain/interfaces/notification-repository.interface';
import { Notification } from 'src/notifications/domain/entities/notification.entity';
import { randomUUID } from 'crypto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { NOTIFICATION_QUEUE } from 'src/notifications/notification.constant';
import { NotificationJobDto } from 'src/notifications/infrastructure/processors/dtos/notification-job.dto';

@CommandHandler(SendNotificationCommand)
export class SendNotificationHandler implements ICommandHandler<SendNotificationCommand> {
  private readonly logger = new Logger(SendNotificationHandler.name);

  constructor(
    @InjectQueue(NOTIFICATION_QUEUE)
    private readonly queue: Queue<NotificationJobDto>,

    @Inject(NOTIFICATION_REPOSITORY_INTERFACE)
    private readonly repository: INotificationRepository,
  ) {}

  async execute(command: SendNotificationCommand): Promise<void> {
    const notification = new Notification(
      randomUUID(),
      command.recipientToken,
      command.message,
    );

    await this.repository.save(notification);
    this.queue.add(
      'send-notification',
      {
        notificationId: notification.id,
        recipientToken: notification.recipientToken,
        message: notification.content,
      },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
      },
    );
  }
}
