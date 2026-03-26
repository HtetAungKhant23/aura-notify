import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { INotificationProvider } from 'src/notifications/domain/interfaces/notification-provider.interface';

@Injectable()
export class FcmNotificationProvider
  implements INotificationProvider, OnModuleInit
{
  private readonly logger = new Logger(FcmNotificationProvider.name);
  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    if (admin.apps.length === 0) {
      const serviceAccount = JSON.parse(
        this.configService.get<string>('FIREBASE_SERVICE_ACCOUNT_JSON'),
      );
      admin.initializeApp({
        credential: serviceAccount,
      });
    }
  }

  async sent(to: string, message: string): Promise<void> {
    try {
      await admin.messaging().send({
        token: to,
        notification: {
          title: 'Aura Notify',
          body: message,
        },
      });
    } catch (err) {
      this.logger.error('FCM Send Error:', err);
      throw new InternalServerErrorException(
        `Failed to send FCM message: ${err.message} \ncode: ${err.code}`,
      );
    }
  }
}
