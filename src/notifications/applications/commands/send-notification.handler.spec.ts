import { Test, TestingModule } from '@nestjs/testing';
import { SendNotificationCommand } from './send-notification.command';
import { NotificationStatus } from 'src/notifications/domain/entities/notification.entity';
import { SendNotificationHandler } from './send-notification.handler';
import { NOTIFICATION_REPOSITORY_INTERFACE } from 'src/notifications/domain/interfaces/service.token';
import { getQueueToken } from '@nestjs/bullmq';
import { NOTIFICATION_QUEUE } from 'src/notifications/notification.constant';

describe('SendNotificationHandler', () => {
  let handler: SendNotificationHandler;
  let mockRepository: any;
  let mockQueue: any;

  beforeEach(async () => {
    mockRepository = { save: jest.fn().mockResolvedValue(undefined) };
    mockQueue = { add: jest.fn().mockResolvedValue({ id: 'job-id' }) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SendNotificationHandler,
        {
          provide: NOTIFICATION_REPOSITORY_INTERFACE,
          useValue: mockRepository,
        },
        { provide: getQueueToken(NOTIFICATION_QUEUE), useValue: mockQueue },
      ],
    }).compile();

    handler = module.get<SendNotificationHandler>(SendNotificationHandler);
  });

  it('should be save notification entity to database and send fcm notification', async () => {
    const to = 'user-123';
    const message =
      'this is integration test for send notification command handler';

    await handler.execute(new SendNotificationCommand(to, message));

    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        status: NotificationStatus.PENDING,
        recipientToken: to,
        content: message,
      }),
    );
    expect(mockQueue.add).toHaveBeenCalledWith(
      'send-notification',
      expect.objectContaining({
        recipientToken: to,
        message,
      }),
      expect.any(Object),
    );
  });
});
