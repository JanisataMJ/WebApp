package config

import (
   "fmt"
   "time"

   "github.com/JanisataMJ/WebApp/entity"
   "gorm.io/driver/sqlite"
   "gorm.io/gorm"
)


var db *gorm.DB

func DB() *gorm.DB {
   return db
}

func ConnectionDB() {
   database, err := gorm.Open(sqlite.Open("HealthMe.db?cache=shared"), &gorm.Config{})

   if err != nil {
       panic("failed to connect database")
   }

   fmt.Println("connected database")
   db = database
}

func SetupDatabase() {

   db.AutoMigrate(
       &entity.User{},
       &entity.Gender{},
       &entity.MoodData{},
       &entity.Notification{},
       &entity.HealthType{},
       &entity.NotificationStatus{},
   )


   GenderMale := entity.Gender{Gender: "Male"}
   GenderFemale := entity.Gender{Gender: "Female"}

   db.FirstOrCreate(&GenderMale, &entity.Gender{Gender: "Male"})
   db.FirstOrCreate(&GenderFemale, &entity.Gender{Gender: "Female"})

   hashedPassword, _ := HashPassword("123456")

   BirthDay, _ := time.Parse("2006-01-02", "1988-11-12")

   User := &entity.User{
       FirstName: "Software",
       LastName:  "Analysis",
       Email:     "sa@gmail.com",
       Password:  hashedPassword,
       Birthdate:  BirthDay,
       GenderID:  1,
	   Picture: "",
   }

   db.FirstOrCreate(User, &entity.User{
       Email: "sa@gmail.com",
   })

   
   initialCalendars := []entity.MoodData{
		{
            UserID: 1,
			Title:      "Animal Feeding",
			CalendarDate:  time.Date(2024, 12, 20, 8, 0, 0, 0, time.UTC),
			AllDay:     true,
		},
		{
            UserID: 1,
			Title:      "Health Checkup",
			CalendarDate:  time.Date(2024, 12, 22, 10, 0, 0, 0, time.UTC),
			AllDay:     true,
		},
	}

	for _, calendar := range initialCalendars {
		db.FirstOrCreate(&calendar, entity.MoodData{Title: calendar.Title, CalendarDate: calendar.CalendarDate})
	}

    // NotificatonStatus
    var statusRead, statusUnread, statusArchived entity.NotificationStatus
    notiStatus := []entity.NotificationStatus{
        {Status: "Readed"},
        {Status: "Unread"},
        {Status: "Archived"},
    }

    for i, status := range notiStatus {
        db.FirstOrCreate(&notiStatus[i], entity.NotificationStatus{Status: status.Status})
    }

    statusRead = notiStatus[0]
    statusUnread = notiStatus[1]
    statusArchived = notiStatus[2]


 
    // HealthType
    var htSafe, htWarning, htDanger entity.HealthType
    healthTypes := []entity.HealthType{
        {Type: "Safe"},
        {Type: "Warning"},
        {Type: "Danger"},
    }

    for i, htype := range healthTypes {
        db.FirstOrCreate(&healthTypes[i], entity.HealthType{Type: htype.Type})
    }

    htSafe = healthTypes[0]
    htWarning = healthTypes[1]
    htDanger = healthTypes[2]


    // Notifications
	noti1 := entity.Notification{
		Timestamp:           time.Now().Add(-300 * time.Hour),
        Title:               "Title 1",
		Message:             "High blood pressure detected!",
		UserID:              1,
		HealthTypeID:        htWarning.ID,
		NotificationStatusID: statusArchived.ID,
	}

	noti2 := entity.Notification{
		Timestamp:           time.Now().Add(-200 * time.Hour),
        Title:               "Title 2",
		Message:             "Normal heart rate.",
		UserID:              1,
		HealthTypeID:        htSafe.ID,
		NotificationStatusID: statusRead.ID,
	}

    noti3 := entity.Notification{
		Timestamp:           time.Now().Add(-30 * time.Hour),
        Title:               "Title 3",
		Message:             "Detected a decreased heart rate.",
		UserID:              1,
		HealthTypeID:        htDanger.ID,
		NotificationStatusID: statusRead.ID,
	}

    noti4 := entity.Notification{
		Timestamp:           time.Now().Add(-24 * time.Hour),
        Title:               "Title 4",
		Message:             "Detected a decreased heart rate.",
		UserID:              1,
		HealthTypeID:        htDanger.ID,
		NotificationStatusID: statusUnread.ID,
	}

    noti5 := entity.Notification{
		Timestamp:           time.Now().Add(-12 * time.Hour),
        Title:               "Title 5",
		Message:             "Detected a decreased heart rate.",
		UserID:              1,
		HealthTypeID:        htDanger.ID,
		NotificationStatusID: statusUnread.ID,
	}

    noti6 := entity.Notification{
		Timestamp:           time.Now(),
        Title:               "Title 6",
		Message:             "Detected a decreased heart rate.",
		UserID:              1,
		HealthTypeID:        htDanger.ID,
		NotificationStatusID: statusUnread.ID,
	}

	db.Create(&noti1)
	db.Create(&noti2)
    db.Create(&noti3)
    db.Create(&noti4)
    db.Create(&noti5)
    db.Create(&noti6)
}
