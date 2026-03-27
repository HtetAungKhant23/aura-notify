export class SendNotificationCommand {
  constructor(
    public readonly recipientToken: string,
    public readonly message: string,
  ) {}
}
