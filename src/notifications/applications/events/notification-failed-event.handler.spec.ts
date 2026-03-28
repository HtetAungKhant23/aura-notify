import { Test, TestingModule } from '@nestjs/testing';
import { NotificationFailedEvent } from 'src/notifications/domain/events/notification-failed.event';
import { NOTIFICATION_REPOSITORY_INTERFACE } from 'src/notifications/domain/interfaces/service.token';
import { NotificationFailedEventHandler } from './notification-failed.event.handler';

describe('NotificationFailedEventHandler', () => {
  let handler: NotificationFailedEventHandler;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationFailedEventHandler,
        {
          provide: NOTIFICATION_REPOSITORY_INTERFACE,
          useValue: mockRepository,
        },
      ],
    }).compile();
    handler = module.get<NotificationFailedEventHandler>(
      NotificationFailedEventHandler,
    );
  });

  it('should check notification exist first and mark notification as failed in database', async () => {
    const mockNotification = { id: 'abc', markAsFailed: jest.fn() };
    mockRepository.findById.mockResolvedValue(mockNotification);

    await handler.handle(new NotificationFailedEvent(mockNotification.id));
    expect(mockRepository.findById).toHaveBeenCalledWith(mockNotification.id);
    expect(mockNotification.markAsFailed).toHaveBeenCalled();
    expect(mockRepository.save).toHaveBeenCalledWith(mockNotification);
  });
});
