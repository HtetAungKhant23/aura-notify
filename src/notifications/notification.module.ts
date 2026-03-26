import { Module } from '@nestjs/common';
import {
  NOTIFICATION_PROVIDER_INTERFACE,
  NOTIFICATION_REPOSITORY_INTERFACE,
} from './domain/interfaces/service.token';
import { TypeOrmNotificationRepository } from './infrastructure/persistence/typeorm-notification.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationSchema } from './infrastructure/persistence/notification.schema';
import { NotificationService } from './applications/services/notification.service';
import { NotificationController } from './interfaces/controllers/notification.controller';
import { FcmNotificationProvider } from './infrastructure/providers/fcm.provider';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationSchema])],
  controllers: [NotificationController],
  providers: [
    NotificationService,
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
