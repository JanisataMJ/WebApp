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

   // user id = 2
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


   // user id = 3
   UserEmail := &entity.User{
        Username:       "UserRealEmail",
        Password:       hashedPassword,
        Email:          "usercpe21@gmail.com",
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
   db.FirstOrCreate(UserEmail, &entity.User{Email: "usercpe21@gmail.com",})


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
            UserID:     1,
			Title:      "Animal Feeding",
			CalendarDate:  time.Date(2024, 12, 20, 8, 0, 0, 0, time.UTC),
			AllDay:     true,
		},
		{
            UserID:     1,
			Title:      "Health Checkup",
			CalendarDate:  time.Date(2024, 12, 22, 10, 0, 0, 0, time.UTC),
			AllDay:     true,
		},
	}

	for _, calendar := range initialCalendars {
		db.FirstOrCreate(&calendar, entity.MoodData{Title: calendar.Title, CalendarDate: calendar.CalendarDate})
	}


    //SmartwatchDevice
    smartwatch1 := entity.SmartwatchDevice{
		Name:               "Samsung 1",
        SerialNumber:       "R7AY700V13B",
		ModelSmartwatch:    "Galaxy Fit3 (EEDD)",
		ModelNumber:        "SM-R390",
		Brand:              "SAMSUNG",
        UserID:             3,
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
		CaloriesBurned: 3000,
		Spo2:           97.0,
        BodyTemp:       37.0,
        UserID:         2,
	}
    healthData2 := entity.HealthData{
		Timestamp:      time.Now(),
        Bpm:            70,
		Steps:          2000,
		SleepHours:     3.00,
		CaloriesBurned: 100,
		Spo2:           90.0,
        BodyTemp:       39.5,
        UserID:         3,
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
        Category:           "Heart Rate",
        Value:              "79",
        Interpretation:     "Normal Heartrate",
        Suggestion:         "อัตราการเต้นหัวใจปกติ",
        HealthDataID:       1,
        RiskLevelID:        lNormal.ID, 
	}
    healthAnalysis2 := entity.HealthAnalysis{
        Category:           "Steps",
        Value:              "10,000 Steps",
        Interpretation:     "5,000 steps completed",
        Suggestion:         "วันนี้คุณทำได้ดีมาก",
        HealthDataID:       1,
        RiskLevelID:        lGood.ID, 
	}
    healthAnalysis3 := entity.HealthAnalysis{
        Category:           "Sleep Hours",
        Value:              "10 Hours",
        Interpretation:     "Long Sleep",
        Suggestion:         "อาจนอนมากเกินไป",
        HealthDataID:       1,
        RiskLevelID:        lBad.ID, 
	}
    healthAnalysis4 := entity.HealthAnalysis{
        Category:           "Calories Burned",
        Value:              "250",
        Interpretation:     "Low Calories Burned",
        Suggestion:         "ควรทำกิจกรรม หรือเคลื่อนไหวร่างกาย",
        HealthDataID:       1,
        RiskLevelID:        lBad.ID, 
	}
    healthAnalysis5 := entity.HealthAnalysis{
        Category:           "SPO2",
        Value:              "97 %",
        Interpretation:     "Normal",
        Suggestion:         "อยู่ในเกณฑ์ที่ดี",
        HealthDataID:       1,
        RiskLevelID:        lGood.ID, 
	}
    healthAnalysis6 := entity.HealthAnalysis{
        Category:           "Body Temperature",
        Value:              "37.0°C",
        Interpretation:     "Normal",
        Suggestion:         "อยู่ในเกณฑ์ที่ดี",
        HealthDataID:       1,
        RiskLevelID:        lNormal.ID, 
	}

    healthAnalysis7 := entity.HealthAnalysis{
        Category:           "Heart Rate",
        Value:              "70",
        Interpretation:     "Normal Heartrate",
        Suggestion:         "อัตราการเต้นหัวใจปกติ",
        HealthDataID:       2,
        RiskLevelID:        lNormal.ID, 
	}
    healthAnalysis8 := entity.HealthAnalysis{
        Category:           "Steps",
        Value:              "2,000 Steps",
        Interpretation:     "Unfinished 5,000 steps",
        Suggestion:         "ควรเดินให้มากขึ้น",
        HealthDataID:       2,
        RiskLevelID:        lBad.ID, 
	}
    healthAnalysis9 := entity.HealthAnalysis{
        Category:           "Sleep Hours",
        Value:              "3 Hours",
        Interpretation:     "Short Sleep",
        Suggestion:         "ควรพักผ่อนให้มากขึ้น",
        HealthDataID:       2,
        RiskLevelID:        lBad.ID, 
	}
    healthAnalysis10 := entity.HealthAnalysis{
        Category:           "Calories Burned",
        Value:              "100",
        Interpretation:     "Low Calories Burned",
        Suggestion:         "ควรทำกิจกรรม หรือเคลื่อนไหวร่างกาย",
        HealthDataID:       2,
        RiskLevelID:        lBad.ID, 
	}
    healthAnalysis11 := entity.HealthAnalysis{
        Category:           "SPO2",
        Value:              "90 %",
        Interpretation:     "Low Oxygen",
        Suggestion:         "ควรปรึกษาและพบแพทย์",
        HealthDataID:       2,
        RiskLevelID:        lBad.ID, 
	}
    healthAnalysis12 := entity.HealthAnalysis{
        Category:           "Body Temperature",
        Value:              "39.5°C",
        Interpretation:     "High Fever",
        Suggestion:         "ควรพักผ่อน และดื่มน้ำเยอะๆ",
        HealthDataID:       2,
        RiskLevelID:        lBad.ID, 
	}

    // user id = 2 , health data id = 1
    db.Create(&healthAnalysis1)
    db.Create(&healthAnalysis2)
    db.Create(&healthAnalysis3)
    db.Create(&healthAnalysis4)
    db.Create(&healthAnalysis5)
    db.Create(&healthAnalysis6)
    // user id = 3 , health data id = 2
    db.Create(&healthAnalysis7)
    db.Create(&healthAnalysis8)
    db.Create(&healthAnalysis9)
    db.Create(&healthAnalysis10)
    db.Create(&healthAnalysis11)
    db.Create(&healthAnalysis12)
    

    //HealthSummary
    healthSum1 := entity.HealthSummary{
		PeriodStart:    time.Now().Add(-720 * time.Hour), 
        PeriodEnd:      time.Now(), 
        AvgBpm:         79.0,
        MinBpm:         75, 
        MaxBpm:         81,
        AvgSteps:       7999.0, 
        TotalSteps:     150000, 
        AvgSleep:       8.0,
        AvgCalories:    500.0,
        AvgSpo2:        94.0,
        AvgBodyTemp:    37.0,
        MinBodyTemp:    36.0, 
        MaxBodyTemp:    37.5, 
        UserID:         2,	
	}
    healthSum2 := entity.HealthSummary{
		PeriodStart:    time.Now().Add(-720 * time.Hour), 
        PeriodEnd:      time.Now(), 
        AvgBpm:         79.0,
        MinBpm:         75, 
        MaxBpm:         81,
        AvgSteps:       7999.0, 
        TotalSteps:     15000, 
        AvgSleep:       4.0,
        AvgCalories:    500.0,
        AvgSpo2:        94.0,
        AvgBodyTemp:    37.0,
        MinBodyTemp:    35.0, 
        MaxBodyTemp:    39.5, 
        UserID:         3,	
	}

	db.Create(&healthSum1)
	db.Create(&healthSum2)


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

    
    // Notifications
    // user id = 2
	noti1 := entity.Notification{
		Timestamp:              time.Now().Add(-12 * time.Hour),
        Title:                  "Over Sleep",
		Message:                "คุณนอนหลับมากเกินไป ควรปรับการนอน",
		UserID:                 2,
		HealthTypeID:           htWarning.ID,
		NotificationStatusID:   statusArchived.ID,
        HealthAnalysisID:       &healthAnalysis3.HealthDataID,
        TrendsID:               trend3.ID,
	}
	noti2 := entity.Notification{
		Timestamp:              time.Now().Add(-2 * time.Hour),
        Title:                  "Too Low Calorie burn",
		Message:                "การเผาผลาญพลังงานมากขึ้น แต่ก็ยังน้อยอยู่ ควรออกกำลังกายหรือเคลื่อนไหวร่างกายให้มากขึ้นกว่านี้",
		UserID:                 2,
		HealthTypeID:           htWarning.ID,
		NotificationStatusID:   statusRead.ID,
        HealthAnalysisID:       &healthAnalysis4.HealthDataID,
        TrendsID:               trend1.ID,
	}
    noti3 := entity.Notification{
		Timestamp:               time.Now(),
        Title:                  "Monthly Health Summary (August)",
		Message:                "สุขภาพโดยรวมของคุณในเดือนนี้อยู่ในขั้นดี และดีขึ้นกว่าเดือนที่แล้ว",
		UserID:                 2,
		HealthTypeID:           htSafe.ID,
		NotificationStatusID:   statusUnread.ID,
        HealthSummaryID:        &healthSum1.ID,
        TrendsID:               trend1.ID,
	}
    // user id = 3
    noti4 := entity.Notification{
		Timestamp:              time.Now().Add(-2 * time.Hour),
        Title:                  "Did not reach step goal",
		Message:                "วันนี้คุณยังเดินไม่ถึงเป้าที่ตั้งไว้",
		UserID:                 3,
		HealthTypeID:           htWarning.ID,
		NotificationStatusID:   statusUnread.ID,
        HealthAnalysisID:       &healthAnalysis8.HealthDataID,
        TrendsID:               trend2.ID,
	}
    noti5 := entity.Notification{
		Timestamp:              time.Now().Add(-12 * time.Hour),
        Title:                  "Insufficient Sleep",
		Message:                "พักผ่อนไม่เพียงพอ ควรนอนให้มากขึ้น",
		UserID:                 3,
		HealthTypeID:           htDanger.ID,
		NotificationStatusID:   statusUnread.ID,
        HealthAnalysisID:       &healthAnalysis9.HealthDataID,
        TrendsID:               trend2.ID,
	}
    noti6 := entity.Notification{
		Timestamp:              time.Now().Add(-12 * time.Hour),
        Title:                  "Too Low Calorie burn",
		Message:                "การเผาผลาญพลังงานต่ำอยู่เสมอ ควรออกกำลังกายมากขึ้น",
		UserID:                 3,
		HealthTypeID:           htWarning.ID,
		NotificationStatusID:   statusUnread.ID,
        HealthAnalysisID:       &healthAnalysis10.HealthDataID,
        TrendsID:               trend2.ID,
	}
    noti7 := entity.Notification{
		Timestamp:              time.Now().Add(-6 * time.Hour),
        Title:                  "Too Low Oxygen",
		Message:                "ออกซิเจนต่ำลง เข้าขั้นวิกฤติ รีบพบแพทย์โดยด่วน",
		UserID:                 3,
		HealthTypeID:           htDanger.ID,
		NotificationStatusID:   statusUnread.ID,
        HealthAnalysisID:       &healthAnalysis11.HealthDataID,
        TrendsID:               trend3.ID,
	}
    noti8 := entity.Notification{
		Timestamp:              time.Now().Add(-2 * time.Hour),
        Title:                  "High Fever",
		Message:                "ไข้สูง ควรพบแพทย์ และพักผ่อน",
		UserID:                 3,
		HealthTypeID:           htDanger.ID,
		NotificationStatusID:   statusUnread.ID,
        HealthAnalysisID:       &healthAnalysis12.HealthDataID,
        TrendsID:               trend3.ID,
	}
    noti9 := entity.Notification{
		Timestamp:              time.Now(),
        Title:                  "Monthly Health Summary (August)",
		Message:                "สุขภาพโดยรวมของคุณในเดือนนี้อยู่ในขั้นอันตราย และแย่ลงกว่าเดือนที่แล้ว",
		UserID:                 3,
		HealthTypeID:           htDanger.ID,
		NotificationStatusID:   statusUnread.ID,
        HealthSummaryID:        &healthSum2.ID,
        TrendsID:               trend3.ID,
	}
    // user id = 2
	db.Create(&noti1)
	db.Create(&noti2)
    db.Create(&noti3)
    // user id = 3
    db.Create(&noti4)
    db.Create(&noti5)
    db.Create(&noti6)
    db.Create(&noti7)
    db.Create(&noti8)
    db.Create(&noti9)
}
