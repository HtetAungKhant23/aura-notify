import { Test, TestingModule } from '@nestjs/testing';
import { Job } from 'bullmq';
import {
  NOTIFICATION_PROVIDER_INTERFACE,
  NOTIFICATION_REPOSITORY_INTERFACE,
} from 'src/notifications/domain/interfaces/service.token';
import { NotificationProcessor } from './notification.processor';
import { NotificationJobDto } from './dtos/notification-job.dto';
import { EventBus } from '@nestjs/cqrs';
import { NotificationSentEvent } from 'src/notifications/domain/events/notification-sent.event';

describe('NotificationProcessor', () => {
  let processor: NotificationProcessor;
  let mockProvider: any;
  let mockRepository: any;
  let mockEventBus: any;

  beforeEach(async () => {
    mockProvider = { send: jest.fn().mockResolvedValue(undefined) };
    mockRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
    };
    mockEventBus = { publish: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationProcessor,
        { provide: NOTIFICATION_PROVIDER_INTERFACE, useValue: mockProvider },
        {
          provide: NOTIFICATION_REPOSITORY_INTERFACE,
          useValue: mockRepository,
        },
        { provide: EventBus, useValue: mockEventBus },
      ],
    }).compile();

    processor = module.get<NotificationProcessor>(NotificationProcessor);
  });

  afterAll(() => {
    jest.clearAllMocks();
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
    expect(mockEventBus.publish).toHaveBeenCalledWith(
      new NotificationSentEvent('abc'),
    );
  });

  it('should throw an error if provider failed', async () => {
    mockProvider.send.mockRejectedValue(new Error('Firebase Down'));

    const mockJob = {
      name: 'send-notification',
      data: {
        notificationId: 'abc',
        recipientToken: 'user-123',
        message: 'this is integration testing for BullMQ Consumer',
      },
    } as Job<NotificationJobDto>;

    await expect(processor.process(mockJob)).rejects.toThrow('Firebase Down');
    expect(mockProvider.send).toHaveBeenCalledWith(
      'user-123',
      'this is integration testing for BullMQ Consumer',
    );
  });
});
