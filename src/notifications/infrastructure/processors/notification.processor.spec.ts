import { Test, TestingModule } from '@nestjs/testing';
import { Job } from 'bullmq';
import { NOTIFICATION_PROVIDER_INTERFACE } from 'src/notifications/domain/interfaces/service.token';
import { NotificationProcessor } from './notification.processor';
import { NotificationJobDto } from './dtos/notification-job.dto';

describe('NotificationProcessor', () => {
  let processor: NotificationProcessor;
  let mockProvider: any;

  beforeEach(async () => {
    mockProvider = { send: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationProcessor,
        { provide: NOTIFICATION_PROVIDER_INTERFACE, useValue: mockProvider },
      ],
    }).compile();

    processor = module.get<NotificationProcessor>(NotificationProcessor);
  });

  it('should send notification via FCM', async () => {
    const mockJob = {
      name: 'send-notification',
      data: {
        notificationId: 'abc',
        recipientToken: 'user-123',
        message: 'this is integration testing for BullMQ Consumer',
      },
    } as Job<NotificationJobDto>;

    await expect(processor.process(mockJob)).resolves.not.toThrow();
    expect(mockProvider.send).toHaveBeenCalledWith(
      'user-123',
      'this is integration testing for BullMQ Consumer',
    );
  });
});
