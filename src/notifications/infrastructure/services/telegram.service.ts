import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { IAlertService } from 'src/notifications/domain/interfaces/alert-service.interface';

@Injectable()
export class TelegramService implements IAlertService {
  private readonly logger = new Logger(TelegramService.name);
  private readonly botToken: string;
  private readonly chatId: string;

  constructor(private readonly configService: ConfigService) {
    this.botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    this.chatId = this.configService.get<string>('TELEGRAM_CHAT_ID');
  }

  async sendAlert(message: string): Promise<void> {
    try {
      const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
      await axios.post(url, {
        chat_id: this.chatId,
        text: message,
        parse_mode: 'HTML',
      });
    } catch (err) {
      this.logger.error(
        'Failed to send Telegram alert:',
        err.response?.data || err.message,
      );
    }
  }
}
