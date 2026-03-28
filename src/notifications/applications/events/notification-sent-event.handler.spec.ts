import { Test, TestingModule } from '@nestjs/testing';
import { NotificationSentEvent } from 'src/notifications/domain/events/notification-sent.event';
import { NOTIFICATION_REPOSITORY_INTERFACE } from 'src/notifications/domain/interfaces/service.token';
import { NotificationSentEventHandler } from './notification-sent-event.handler';

describe('NotificationSentEventHandler', () => {
  let handler: NotificationSentEventHandler;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationSentEventHandler,
        {
          provide: NOTIFICATION_REPOSITORY_INTERFACE,
          useValue: mockRepository,
        },
      ],
    }).compile();
    handler = module.get<NotificationSentEventHandler>(
      NotificationSentEventHandler,
    );
  });

  it('should check notification exist first and mark notification as sent in database', async () => {
    const mockNotification = { id: 'abc', markAsSent: jest.fn() };
    mockRepository.findById.mockResolvedValue(mockNotification);

    await handler.handle(new NotificationSentEvent(mockNotification.id));
    expect(mockRepository.findById).toHaveBeenCalledWith(mockNotification.id);
    expect(mockNotification.markAsSent).toHaveBeenCalled();
    expect(mockRepository.save).toHaveBeenCalledWith(mockNotification);
  });
});
