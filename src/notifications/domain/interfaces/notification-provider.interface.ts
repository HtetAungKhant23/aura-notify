export interface INotificationProvider {
  send(to: string, message: string): Promise<void>;
}
