export interface IAlertService {
  sendAlert(message: string): Promise<void>;
}
