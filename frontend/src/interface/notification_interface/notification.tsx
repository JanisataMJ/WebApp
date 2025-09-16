export interface NotificationStatusInterface {
  ID: number;
  Status: string;
}

export interface HealthTypeInterface {
  ID: number;
  Type: string;
}

export interface NotificationInterface {
  ID: number;       
  Timestamp: string;
  Title: string;
  Message: string;

  UserID: number;
  HealthTypeID: number;
  NotificationStatusID: number;

  HealthType?: HealthTypeInterface;
  NotificationStatus?: NotificationStatusInterface;
}
