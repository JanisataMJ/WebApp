export interface NotificationInterface {
    ID:         number;       
    Timestamp:  string;
	Title:		string;
	Message: 	string;

	UserID:		            number;
	HealthTypeID :	        number;
	NotificationStatusID: 	number;

    HealthType?: {
        ID: number;
        Type: string;
    };

    NotificationStatus?: {
        ID: number;
        Status: string;
    };
}