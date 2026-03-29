import { Module } from '@nestjs/common';
import {
  ALERT_SERVICE_INTERFACE,
  NOTIFICATION_PROVIDER_INTERFACE,
  NOTIFICATION_REPOSITORY_INTERFACE,
} from './domain/interfaces/service.token';
import { TypeOrmNotificationRepository } from './infrastructure/persistence/typeorm-notification.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationSchema } from './infrastructure/persistence/notification.schema';
import { NotificationController } from './interfaces/controllers/notification.controller';
import { FcmNotificationProvider } from './infrastructure/providers/fcm.provider';
import { CqrsModule } from '@nestjs/cqrs';
import { SendNotificationHandler } from './applications/commands/send-notification.handler';
import { BullModule } from '@nestjs/bullmq';
import { NOTIFICATION_QUEUE } from './notification.constant';
import { NotificationProcessor } from './infrastructure/processors/notification.processor';
import { NotificationSentEventHandler } from './applications/events/notification-sent-event.handler';
import { NotificationFailedEventHandler } from './applications/events/notification-failed.event.handler';
import { TelegramService } from './infrastructure/services/telegram.service';

@Module({
  imports: [
    CqrsModule,
    BullModule.registerQueue({
      name: NOTIFICATION_QUEUE,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: {
          age: 3600,
          count: 100,
        },
        removeOnFail: {
          age: 24 * 3600 * 5,
          count: 5000,
        },
      },
    }),
    TypeOrmModule.forFeature([NotificationSchema]),
  ],
  controllers: [NotificationController],
  providers: [
    SendNotificationHandler,
    NotificationProcessor,
    NotificationSentEventHandler,
    NotificationFailedEventHandler,
    { provide: ALERT_SERVICE_INTERFACE, useClass: TelegramService },
    {
      provide: NOTIFICATION_REPOSITORY_INTERFACE,
      useClass: TypeOrmNotificationRepository,
    },
    {
      provide: NOTIFICATION_PROVIDER_INTERFACE,
      useClass: FcmNotificationProvider,
    },
  ],
})
export class NotificationModule {}
