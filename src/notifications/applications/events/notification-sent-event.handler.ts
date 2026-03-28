import { Inject, Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { NotificationSentEvent } from 'src/notifications/domain/events/notification-sent.event';
import { INotificationRepository } from 'src/notifications/domain/interfaces/notification-repository.interface';
import { NOTIFICATION_REPOSITORY_INTERFACE } from 'src/notifications/domain/interfaces/service.token';

@EventsHandler(NotificationSentEvent)
export class NotificationSentEventHandler implements IEventHandler<NotificationSentEvent> {
  private readonly logger = new Logger(NotificationSentEventHandler.name);

  constructor(
    @Inject(NOTIFICATION_REPOSITORY_INTERFACE)
    private readonly repository: INotificationRepository,
  ) {}

  async handle(event: NotificationSentEvent): Promise<void> {
    const notification = await this.repository.findById(event.notificationId);
    if (notification) {
      notification.markAsSent();
      await this.repository.save(notification);
      this.logger.log(
        `[Notification Sent Event] Database updated for ${event.notificationId}`,
      );
    }
  }
}
