import { Module } from '@nestjs/common';
import {
  NOTIFICATION_PROVIDER_INTERFACE,
  NOTIFICATION_REPOSITORY_INTERFACE,
} from './domain/interfaces/service.token';
import { TypeOrmNotificationRepository } from './infrastructure/persistence/typeorm-notification.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationSchema } from './infrastructure/persistence/notification.schema';
import { NotificationController } from './interfaces/controllers/notification.controller';
import { FcmNotificationProvider } from './infrastructure/providers/fcm.provider';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([NotificationSchema])],
  controllers: [NotificationController],
  providers: [
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
