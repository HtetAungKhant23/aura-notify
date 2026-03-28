import { Notification } from '../entities/notification.entity';

export interface INotificationRepository {
  save(notification: Notification): Promise<void>;
  findById(notificationId: string): Promise<Notification | null>;
}
