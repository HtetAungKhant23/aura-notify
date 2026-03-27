import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, InternalServerErrorException, Logger } from '@nestjs/common';
import { SendNotificationCommand } from './send-notification.command';
import {
  NOTIFICATION_PROVIDER_INTERFACE,
  NOTIFICATION_REPOSITORY_INTERFACE,
} from 'src/notifications/domain/interfaces/service.token';
import { INotificationProvider } from 'src/notifications/domain/interfaces/notification-provider.interface';
import { INotificationRepository } from 'src/notifications/domain/interfaces/notification-repository.interface';
import { Notification } from 'src/notifications/domain/entities/notification.entity';
import { randomUUID } from 'crypto';

@CommandHandler(SendNotificationCommand)
export class SendNotificationHandler implements ICommandHandler<SendNotificationCommand> {
  private readonly logger = new Logger(SendNotificationHandler.name);

  constructor(
    @Inject(NOTIFICATION_PROVIDER_INTERFACE)
    private readonly provider: INotificationProvider,
    @Inject(NOTIFICATION_REPOSITORY_INTERFACE)
    private readonly repository: INotificationRepository,
  ) {}

  async execute(command: SendNotificationCommand): Promise<void> {
    const notification = new Notification(
      randomUUID(),
      command.recipientToken,
      command.message,
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
