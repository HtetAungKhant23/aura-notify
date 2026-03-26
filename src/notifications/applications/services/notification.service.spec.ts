import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { NotificationStatus } from 'src/notifications/domain/entities/notification.entity';

describe('NotificationService', () => {
  let service: NotificationService;
  let mockRepository: any;
  let mockProvider: any;

  beforeEach(async () => {
    mockRepository = { save: jest.fn().mockResolvedValue(undefined) };
    mockProvider = { send: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: 'INotificationRepository',
          useValue: mockRepository,
        },
        { provide: 'INotificationProvider', useValue: mockProvider },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  it('should be save notification entity to database and send fcm notification', async () => {
    await service.sendNotification({
      recipientToken: 'user-123',
      message: 'this is integration testing for service',
    });

    expect(mockProvider.send).toHaveBeenCalledWith(
      'user-123',
      'this is integration testing for service',
    );
    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        status: NotificationStatus.SENT,
        recipientToken: 'user-123',
        content: 'this is integration testing for service',
      }),
    );
  });

  it('should be save notification entity to database with Failed status', async () => {
    mockProvider.send.mockRejectedValue(new Error('Firebase Down'));

    await expect(
      service.sendNotification({
        recipientToken: 'user-123',
        message: 'this is integration testing for service',
      }),
    ).rejects.toThrow('Failed to send notification: Firebase Down');

    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        status: NotificationStatus.FAILED,
        recipientToken: 'user-123',
        content: 'this is integration testing for service',
      }),
    );
  });
});
