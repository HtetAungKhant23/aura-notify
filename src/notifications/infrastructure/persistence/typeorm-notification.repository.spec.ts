import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Notification } from 'src/notifications/domain/entities/notification.entity';
import { Repository } from 'typeorm';

describe('TypeOrmNotificationRepository', () => {
  let repository: TypeOrmNotificationRepository;
  let ormRepository: Repository<any>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [NotificationSchema],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([NotificationSchema]),
      ],
      providers: [TypeOrmNotificationRepository],
    }).compile();

    repository = module.get<TypeOrmNotificationRepository>(
      TypeOrmNotificationRepository,
    );
    ormRepository = module.get(getRepositoryToken(NotificationSchema));
  });

  it('should save a notification entity to database', async () => {
    const notification = new Notification(
      randomUUID(),
      'user-123',
      'this is integration testing for database',
    );

    await repository.save(notification);

    const saveData = await ormRepository.findOne({
      where: { id: notification.id },
    });

    expect(repository.save).toHaveBeenCalledWith(notification);
    expect(saveData).toBeDefined();
    expect(saveData.recipientToken).toBe(notification.recipientToken);
    expect(saveData.content).toBe(notification.content);
    expect(saveData.status).toBe(notification.status);
  });
});
