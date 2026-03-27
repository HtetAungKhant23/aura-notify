import { Test, TestingModule } from '@nestjs/testing';
import { SendNotificationCommand } from './send-notification.command';
import { NotificationStatus } from 'src/notifications/domain/entities/notification.entity';
import { SendNotificationHandler } from './send-notification.handler';
import {
  NOTIFICATION_PROVIDER_INTERFACE,
  NOTIFICATION_REPOSITORY_INTERFACE,
} from 'src/notifications/domain/interfaces/service.token';

describe('SendNotificationHandler', () => {
  let handler: SendNotificationHandler;
  let mockProvider: any;
  let mockRepository: any;

  beforeEach(async () => {
    mockProvider = { send: jest.fn().mockResolvedValue(undefined) };
    mockRepository = { save: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SendNotificationHandler,
        {
          provide: NOTIFICATION_REPOSITORY_INTERFACE,
          useValue: mockRepository,
        },
        { provide: NOTIFICATION_PROVIDER_INTERFACE, useValue: mockProvider },
      ],
    }).compile();

    handler = module.get<SendNotificationHandler>(SendNotificationHandler);
  });

  it('should be save notification entity to database and send fcm notification', async () => {
    const to = 'user-123';
    const message =
      'this is integration test for send notification command handler';

    await handler.execute(new SendNotificationCommand(to, message));

    expect(mockProvider.send).toHaveBeenCalledWith(to, message);
    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        status: NotificationStatus.SENT,
        recipientToken: to,
        content: message,
      }),
    );
  });

  it('should be save notification entity to database with Failed status', async () => {
    mockProvider.send.mockRejectedValue(new Error('Firebase Down'));

    const to = 'user-123';
    const message =
      'this is integration test for send notification command handler';

    await expect(
      handler.execute(new SendNotificationCommand(to, message)),
    ).rejects.toThrow('Failed to send notification: Firebase Down');

    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        status: NotificationStatus.FAILED,
        recipientToken: to,
        content: message,
      }),
    );
  });
});
