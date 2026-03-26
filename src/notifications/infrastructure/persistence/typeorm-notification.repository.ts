import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from 'src/notifications/domain/entities/notification.entity';
import { INotificationRepository } from 'src/notifications/domain/interfaces/notification-repository.interface';
import { NotificationSchema } from './notification.schema';
import { Repository } from 'typeorm';

@Injectable()
export class TypeOrmNotificationRepository implements INotificationRepository {
  constructor(
    @InjectRepository(NotificationSchema)
    private readonly repository: Repository<Notification>,
  ) {}

  async save(notification: Notification): Promise<void> {
    await this.repository.save(notification);
  }
}
