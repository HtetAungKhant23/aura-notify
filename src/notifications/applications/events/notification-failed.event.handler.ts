import { Inject, Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { NotificationFailedEvent } from 'src/notifications/domain/events/notification-failed.event';
import { INotificationRepository } from 'src/notifications/domain/interfaces/notification-repository.interface';
import { NOTIFICATION_REPOSITORY_INTERFACE } from 'src/notifications/domain/interfaces/service.token';

@EventsHandler(NotificationFailedEvent)
export class NotificationFailedEventHandler implements IEventHandler<NotificationFailedEvent> {
  private readonly logger = new Logger(NotificationFailedEventHandler.name);

  constructor(
    @Inject(NOTIFICATION_REPOSITORY_INTERFACE)
    private readonly repository: INotificationRepository,
  ) {}

  async handle(event: NotificationFailedEvent): Promise<void> {
    const notification = await this.repository.findById(event.notificationId);
    if (notification) {
      notification.markAsFailed();
      await this.repository.save(notification);
      this.logger.log(
        `save markAsFailed status to database for failed notificationId: ${notification.id}`,
      );
    }
  }
}
