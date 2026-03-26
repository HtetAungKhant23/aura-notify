import { Module } from '@nestjs/common';
import { NOTIFICATION_REPOSITORY_INTERFACE } from './domain/interfaces/service.token';
import { TypeOrmNotificationRepository } from './infrastructure/persistence/typeorm-notification.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationSchema } from './infrastructure/persistence/notification.schema';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationSchema])],
  providers: [
    {
      provide: NOTIFICATION_REPOSITORY_INTERFACE,
      useClass: TypeOrmNotificationRepository,
    },
  ],
})
export class NotificationModule {}
