import { Test, TestingModule } from '@nestjs/testing';
import { Job } from 'bullmq';
import {
  NOTIFICATION_PROVIDER_INTERFACE,
  NOTIFICATION_REPOSITORY_INTERFACE,
} from 'src/notifications/domain/interfaces/service.token';
import { NotificationProcessor } from './notification.processor';
import { NotificationJobDto } from './dtos/notification-job.dto';

describe('NotificationProcessor', () => {
  let processor: NotificationProcessor;
  let mockProvider: any;
  let mockRepository: any;

  beforeEach(async () => {
    mockProvider = { send: jest.fn().mockResolvedValue(undefined) };
    mockRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationProcessor,
        { provide: NOTIFICATION_PROVIDER_INTERFACE, useValue: mockProvider },
        {
          provide: NOTIFICATION_REPOSITORY_INTERFACE,
          useValue: mockRepository,
        },
      ],
    }).compile();

    processor = module.get<NotificationProcessor>(NotificationProcessor);
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('should send notification via FCM', async () => {
    const mockNotification = { id: 'abc', markAsSent: jest.fn() };
    mockRepository.findById.mockResolvedValue(mockNotification);

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
    expect(mockRepository.findById).toHaveBeenCalledWith(mockNotification.id);
    expect(mockNotification.markAsSent).toHaveBeenCalled();
    expect(mockRepository.save).toHaveBeenCalledWith(mockNotification);
  });

  it('should throw an error if provider failed', async () => {
    mockProvider.send.mockRejectedValue(new Error('Firebase Down'));
    const mockNotification = { id: 'abc', markAsFailed: jest.fn() };
    mockRepository.findById.mockResolvedValue(mockNotification);

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
    expect(mockRepository.findById).toHaveBeenCalledWith(mockNotification.id);
    expect(mockNotification.markAsFailed).toHaveBeenCalled();
    expect(mockRepository.save).toHaveBeenCalledWith(mockNotification);
  });
});
