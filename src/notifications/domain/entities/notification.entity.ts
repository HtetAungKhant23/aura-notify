export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
}

export class Notification {
  private _status: NotificationStatus;

  constructor(
    public readonly id: string,
    public readonly recipientToken: string,
    public readonly content: string,
    status: NotificationStatus = NotificationStatus.PENDING,
  ) {
    this._status = status;
  }

  get status(): NotificationStatus {
    return this._status;
  }

  set status(value: NotificationStatus) {
    this._status = value;
  }

  markAsSent(): void {
    this._status = NotificationStatus.SENT;
  }

  markAsFailed(): void {
    this._status = NotificationStatus.FAILED;
  }
}
