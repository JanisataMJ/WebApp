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
       &entity.Role{},
       &entity.Gender{},
       &entity.MoodData{},
       &entity.Notification{},
       &entity.Trends{},
       &entity.HealthType{},
       &entity.NotificationStatus{},
       &entity.HealthAnalysis{},
       &entity.RiskLevel{},
       &entity.HealthSummary{},
       &entity.HealthData{},
       &entity.SmartwatchDevice{},
   )


   GenderMale := entity.Gender{Gender: "Male"}
   GenderFemale := entity.Gender{Gender: "Female"}

   db.FirstOrCreate(&GenderMale, &entity.Gender{Gender: "Male"})
   db.FirstOrCreate(&GenderFemale, &entity.Gender{Gender: "Female"})

    AdminRole := entity.Role{Name: "Admin"}
    UserRole := entity.Role{Name: "User"}

    db.FirstOrCreate(&AdminRole, &entity.Role{Name: "Admin"})
	db.FirstOrCreate(&UserRole, &entity.Role{Name: "User"})

   hashedPassword, _ := HashPassword("123456")

   BirthDay, _ := time.Parse("2006-01-02", "1988-11-12")

   User1 := &entity.User{
        Username:       "User1",
        Password:       hashedPassword,
        Email:          "sa@gmail.com",
        FirstName:      "Software",
        LastName:       "Analysis",
        Birthdate:      BirthDay,
        Phonenumber:    "0866666666",
        Picture:        "photo",
        Height:         166,
        Weight:         55,
        Bust:           33,
        Waist:          25,
        Hip:            37,
        RoleID:         1,
        GenderID:       1,
   }
   db.FirstOrCreate(User1, &entity.User{Email: "sa@gmail.com"})

   User2 := &entity.User{
        Username:       "User2",
        Password:       hashedPassword,
        Email:          "webapp@gmail.com",
        FirstName:      "Web",
        LastName:       "App",
        Birthdate:      BirthDay,
        Phonenumber:    "0866666666",
        Picture:        "photo",
        Height:         166,
        Weight:         55,
        Bust:           33,
        Waist:          25,
        Hip:            37,
        RoleID:         1,
        GenderID:       2,
   }
   db.FirstOrCreate(User2, &entity.User{Email: "webapp@gmail.com",})

   Admin1 := &entity.User{
        Username:       "Admin1",
        Password:       hashedPassword,
        Email:          "admin1@gmail.com",
        FirstName:      "Admin",
        LastName:       "Admin",
        Birthdate:      BirthDay,
        Phonenumber:    "0899999999",
        Picture:        "photo",
        Height:         166,
        Weight:         55,
        Bust:           33,
        Waist:          25,
        Hip:            37,
        RoleID:         1,
        GenderID:       2,
   }
   db.FirstOrCreate(Admin1, &entity.User{Email: "admin1@gmail.com",})


   
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


    //SmartwatchDevice
    smartwatch1 := entity.SmartwatchDevice{
		Name:               "Samsung 1",
        SerialNumber:       "R7AY700V13B",
		ModelSmartwatch:    "Galaxy Fit3 (EEDD)",
		ModelNumber:        "SM-R390",
		Brand:              "SAMSUNG",
        UserID:             1,
	}

    smartwatch2 := entity.SmartwatchDevice{
		Name:               "Oppo 1",
        SerialNumber:       "A1AA100A10A",
		ModelSmartwatch:    "Oppo band",
		ModelNumber:        "PO-A110",
		Brand:              "OPPO",
        UserID:             2,
	}

	db.Create(&smartwatch1)
    db.Create(&smartwatch2)


    //HealthData
    healthData1 := entity.HealthData{
		Timestamp:      time.Now(),
        Bpm:            79,
		Steps:          10000,
		SleepHours:     10.00,
		CaloriesBurned: 250,
		Spo2:           97.0,
        BodyTemp:       38.0,
        UserID:         1,
	}

    healthData2 := entity.HealthData{
		Timestamp:      time.Now(),
        Bpm:            72,
		Steps:          5000,
		SleepHours:     8.00,
		CaloriesBurned: 100,
		Spo2:           98.0,
        BodyTemp:       36.5,
        UserID:         2,
	}

	db.Create(&healthData1)
    db.Create(&healthData2)


    // RiskLevel
    var lGood, lNormal, lBad entity.RiskLevel
    Rlevels := []entity.RiskLevel{
        {Rlevel: "Good"},
        {Rlevel: "Normal"},
        {Rlevel: "Bad"},
    }

    for i, level := range Rlevels {
        db.FirstOrCreate(&Rlevels[i], entity.RiskLevel{Rlevel: level.Rlevel})
    }

    lGood = Rlevels[0]
    lNormal = Rlevels[1]
    lBad = Rlevels[2]



    //HealthAnalysis
    healthAnalysis1 := entity.HealthAnalysis{
        Category:           "Body Temperature",
        Value:              "38.0°C",
        Interpretation:     "High Fever",
        Suggestion:         "ควรพักผ่อนและดื่มน้ำ หรือ พบแพทย์",
        HealthDataID:       1,
        RiskLevelID:       lBad.ID, 
	}

    healthAnalysis2 := entity.HealthAnalysis{
        Category:           "Heart Rate",
        Value:              "79",
        Interpretation:     "Normal",
        Suggestion:         "อยู่ในเกณฑ์ที่ดี",
        HealthDataID:       1,
        RiskLevelID:       lNormal.ID, 
	}

    healthAnalysis3 := entity.HealthAnalysis{
        Category:           "Steps",
        Value:              "10,000 Steps",
        Interpretation:     "10,000 steps completed",
        Suggestion:         "วันนี้คุณทำได้ดีมาก",
        HealthDataID:       1,
        RiskLevelID:       lGood.ID, 
	}

    db.Create(&healthAnalysis1)
    db.Create(&healthAnalysis2)
    db.Create(&healthAnalysis3)



    //Trends
    var trend1, trend2, trend3 entity.Trends
    trend := []entity.Trends{
        {Trend: "Improving"},
        {Trend: "Stable"},
        {Trend: "Worsening"},
    }
    for i, ttrend := range trend {
        db.FirstOrCreate(&trend[i], entity.Trends{Trend: ttrend.Trend})
    }

    trend1 = trend[0]
    trend2 = trend[1]
    trend3 = trend[2]

    //HealthSummary
    healthSum1 := entity.HealthSummary{
		PeriodStart:    time.Now().Add(-300 * time.Hour), 
        PeriodEnd:      time.Now(), 
        AvgBpm:         79.0,
        MinBpm:         75, 
        MaxBpm:         81,
        AvgSteps:       7999.0, 
        TotalSteps:     15000, 
        AvgSleep:       6.0,
        AvgCalories:    500.0,
        AvgSpo2:        94.0,
        AvgBodyTemp:    37.0,
        MinBodyTemp:    36.0, 
        MaxBodyTemp:    37.5, 
        UserID:         1,	
	}

    healthSum2 := entity.HealthSummary{
		PeriodStart:    time.Now().Add(-500 * time.Hour), 
        PeriodEnd:      time.Now(), 
        AvgBpm:         79.0,
        MinBpm:         75, 
        MaxBpm:         81,
        AvgSteps:       7999.0, 
        TotalSteps:     15000, 
        AvgSleep:       6.0,
        AvgCalories:    500.0,
        AvgSpo2:        94.0,
        AvgBodyTemp:    37.0,
        MinBodyTemp:    36.0, 
        MaxBodyTemp:    37.5, 
        UserID:         2,	
	}

	db.Create(&healthSum1)
	db.Create(&healthSum2)


    
    // Notifications
	noti1 := entity.Notification{
		Timestamp:              time.Now().Add(-300 * time.Hour),
        Title:                  "Title 1",
		Message:                "High blood pressure detected!",
		UserID:                 1,
		HealthTypeID:           htWarning.ID,
		NotificationStatusID:   statusArchived.ID,
        HealthSummaryID:        1,
        HealthAnalysisID:       1,
        TrendsID:               trend1.ID,
	}

	noti2 := entity.Notification{
		Timestamp:              time.Now().Add(-200 * time.Hour),
        Title:                  "Title 2",
		Message:                "Normal heart rate.",
		UserID:                 2,
		HealthTypeID:           htSafe.ID,
		NotificationStatusID:   statusRead.ID,
        HealthSummaryID:        1,
        HealthAnalysisID:       1,
        TrendsID:               trend2.ID,
	}

    noti3 := entity.Notification{
		Timestamp:               time.Now().Add(-30 * time.Hour),
        Title:                  "Title 3",
		Message:                "Detected a decreased heart rate.",
		UserID:                 1,
		HealthTypeID:           htDanger.ID,
		NotificationStatusID:   statusRead.ID,
        HealthSummaryID:        1,
        HealthAnalysisID:       1,
        TrendsID:               trend3.ID,
	}

    noti4 := entity.Notification{
		Timestamp:              time.Now().Add(-24 * time.Hour),
        Title:                  "Title 4",
		Message:                "Detected a decreased heart rate.",
		UserID:                 2,
		HealthTypeID:           htDanger.ID,
		NotificationStatusID:   statusUnread.ID,
        HealthSummaryID:        1,
        HealthAnalysisID:       1,
        TrendsID:               trend1.ID,
	}

    noti5 := entity.Notification{
		Timestamp:              time.Now().Add(-12 * time.Hour),
        Title:                  "Title 5",
		Message:                "Detected a decreased heart rate.",
		UserID:                 1,
		HealthTypeID:           htDanger.ID,
		NotificationStatusID:   statusUnread.ID,
        HealthSummaryID:        1,
        HealthAnalysisID:       1,
        TrendsID:               trend2.ID,
	}

    noti6 := entity.Notification{
		Timestamp:              time.Now(),
        Title:                  "Title 6",
		Message:                "Detected a decreased heart rate.",
		UserID:                 2,
		HealthTypeID:           htDanger.ID,
		NotificationStatusID:   statusUnread.ID,
        HealthSummaryID:        1,
        HealthAnalysisID:       1,
        TrendsID:               trend3.ID,
	}

	db.Create(&noti1)
	db.Create(&noti2)
    db.Create(&noti3)
    db.Create(&noti4)
    db.Create(&noti5)
    db.Create(&noti6)
    
}