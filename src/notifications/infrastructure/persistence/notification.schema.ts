import {
  Notification,
  NotificationStatus,
} from 'src/notifications/domain/entities/notification.entity';
import { EntitySchema } from 'typeorm';

export const NotificationSchema = new EntitySchema<Notification>({
  name: 'Notification',
  target: Notification,
  columns: {
    id: { type: String, primary: true },
    recipientToken: { type: String },
    content: { type: 'text' },
    status: {
      type: 'simple-enum',
      enum: NotificationStatus,
      default: NotificationStatus.PENDING,
    },
  },
});
