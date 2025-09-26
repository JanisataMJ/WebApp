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
       &entity.Article{},
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
        Username:       "James",
        Password:       hashedPassword,
        Email:          "user1@gmail.com",
        FirstName:      "James",
        LastName:       "Smith",
        Birthdate:      BirthDay,
        Phonenumber:    "0866666666",
        Profile:        "uploads/Profiles/profile1.jpeg",
        Height:         186,
        Weight:         75,
        Bust:           42,
        Waist:          35,
        Hip:            37,
        RoleID:         2,
        GenderID:       1,
   }
   db.FirstOrCreate(User1, &entity.User{Email: "user1@gmail.com"})

   // user id = 2
   User2 := &entity.User{
        Username:       "Emily",
        Password:       hashedPassword,
        Email:          "user2@gmail.com",
        FirstName:      "Emily",
        LastName:       "Davis",
        Birthdate:      BirthDay,
        Phonenumber:    "0861234567",
        Profile:        "uploads/Profiles/profile2.jpeg",
        Height:         166,
        Weight:         55,
        Bust:           33,
        Waist:          25,
        Hip:            37,
        RoleID:         2,
        GenderID:       2,
   }
   db.FirstOrCreate(User2, &entity.User{Email: "user2@gmail.com",})


   // user id = 3
   UserEmail := &entity.User{
        Username:       "William",
        Password:       hashedPassword,
        Email:          "usercpe21@gmail.com",
        FirstName:      "William",
        LastName:       "Brown",
        Birthdate:      BirthDay,
        Phonenumber:    "0925552121",
        Profile:        "uploads/Profiles/profile3.jpeg",
        Height:         177,
        Weight:         67,
        Bust:           40,
        Waist:          33,
        Hip:            35,
        RoleID:         2,
        GenderID:       1,
   }
   db.FirstOrCreate(UserEmail, &entity.User{Email: "usercpe21@gmail.com",})


   Admin1 := &entity.User{
        Username:       "Admin1",
        Password:       hashedPassword,
        Email:          "admin1@gmail.com",
        FirstName:      "Olivia",
        LastName:       "Wilson",
        Birthdate:      BirthDay,
        Phonenumber:    "0871914646",
        Profile:        "uploads/Profiles/profile4.jpeg",
        RoleID:         1,
        GenderID:       2,
   }
   db.FirstOrCreate(Admin1, &entity.User{Email: "admin1@gmail.com",})

   Admin2 := &entity.User{
        Username:       "Admin2",
        Password:       hashedPassword,
        Email:          "admin2@gmail.com",
        FirstName:      "Michael",
        LastName:       "Johnson",
        Birthdate:      BirthDay,
        Phonenumber:    "0642339911",
        Profile:        "uploads/Profiles/profile5.jpeg",
        RoleID:         1,
        GenderID:       1,
   }
   db.FirstOrCreate(Admin2, &entity.User{Email: "admin2@gmail.com",})


   OppoUser := &entity.User{
        Username:       "OppoUser",
        Password:       hashedPassword,
        Email:          "user10@gmail.com",
        FirstName:      "User10",
        LastName:       "Oppo",
        Birthdate:      BirthDay,
        Phonenumber:    "0861234567",
        Profile:        "uploads/Profiles/profile10.jpeg",
        Height:         166,
        Weight:         55,
        Bust:           33,
        Waist:          25,
        Hip:            37,
        RoleID:         2,
        GenderID:       2,
   }
   db.FirstOrCreate(OppoUser, &entity.User{Email: "user10@gmail.com",})


   
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
		SleepHours:     "10 h. 30 m.",
		CaloriesBurned: 3000,
		Spo2:           97.0,
        //BodyTemp:       37.0,
        UserID:         2,
	}
    healthData2 := entity.HealthData{
		Timestamp:      time.Now(),
        Bpm:            70,
		Steps:          2000,
		SleepHours:     "3 h. 30 m.",
		CaloriesBurned: 100,
		Spo2:           90.0,
        //BodyTemp:       39.5,
        UserID:         3,
	}
	db.Create(&healthData1)
    db.Create(&healthData2)



    lGood := entity.RiskLevel{
		Rlevel: "ดี",
	}

    lNormal := entity.RiskLevel{
		Rlevel: "ปกติ",
	}

    lBad := entity.RiskLevel{
		Rlevel: "เสี่ยง",
	}

    llow := entity.RiskLevel{
		Rlevel: "ต่ำ",
	}

	db.Create(&lGood)
	db.Create(&lNormal)
	db.Create(&lBad)
    db.Create(&llow)



    //HealthAnalysis
    healthAnalysis1 := entity.HealthAnalysis{
        Category:           "อัตราการเต้นหัวใจ",
        Value:              "79",
        Interpretation:     "อัตราการเต้นหัวใจปกติ",
        Suggestion:         "อัตราการเต้นหัวใจปกติดี",
        HealthDataID:       1,
        RiskLevelID:        lNormal.ID, 
	}
    healthAnalysis2 := entity.HealthAnalysis{
        Category:           "จำนวนก้าว",
        Value:              "10,000 ก้าว",
        Interpretation:     "เดินครบ 5,000 ก้าว",
        Suggestion:         "วันนี้คุณทำได้ดีมาก",
        HealthDataID:       1,
        RiskLevelID:        lGood.ID, 
	}
    healthAnalysis3 := entity.HealthAnalysis{
        Category:           "การนอนหลับ",
        Value:              "10 ชั่วโมง",
        Interpretation:     "นอนหลับนาน",
        Suggestion:         "คุณนอนหลับมากเกินไป",
        HealthDataID:       1,
        RiskLevelID:        lBad.ID, 
	}
    healthAnalysis4 := entity.HealthAnalysis{
        Category:           "พลังงานที่ใช้ไป",
        Value:              "250",
        Interpretation:     "เผาผลาญพลังงานไม่เพียงพอ",
        Suggestion:         "ควรทำกิจกรรม หรือเคลื่อนไหวร่างกาย",
        HealthDataID:       1,
        RiskLevelID:        lBad.ID, 
	}
    healthAnalysis5 := entity.HealthAnalysis{
        Category:           "ออกซิเจนในเลือด",
        Value:              "97 %",
        Interpretation:     "ปกติ",
        Suggestion:         "อยู่ในเกณฑ์ที่ดี",
        HealthDataID:       1,
        RiskLevelID:        lGood.ID, 
	}
    healthAnalysis6 := entity.HealthAnalysis{
        Category:           "อุณหภูมิร่างกาย",
        Value:              "37.0°C",
        Interpretation:     "ปกติ",
        Suggestion:         "อยู่ในเกณฑ์ที่ดี",
        HealthDataID:       1,
        RiskLevelID:        lNormal.ID, 
	}

    healthAnalysis7 := entity.HealthAnalysis{
        Category:           "อัตราการเต้นหัวใจ",
        Value:              "70",
        Interpretation:     "อัตราการเต้นหัวใจปกติ",
        Suggestion:         "อัตราการเต้นหัวใจปกติดี",
        HealthDataID:       2,
        RiskLevelID:        lNormal.ID, 
	}
    healthAnalysis8 := entity.HealthAnalysis{
        Category:           "จำนวนก้าว",
        Value:              "2,000 ก้าว",
        Interpretation:     "ยังเดินไม่ครบ 5,000 ก้าว",
        Suggestion:         "ควรเดินให้มากขึ้น",
        HealthDataID:       2,
        RiskLevelID:        lBad.ID, 
	}
    healthAnalysis9 := entity.HealthAnalysis{
        Category:           "การนอนหลับ",
        Value:              "3 ชั่วโมง",
        Interpretation:     "นอนน้อย",
        Suggestion:         "ควรพักผ่อนให้มากขึ้น",
        HealthDataID:       2,
        RiskLevelID:        lBad.ID, 
	}
    healthAnalysis10 := entity.HealthAnalysis{
        Category:           "พลังงานที่ใช้ไป",
        Value:              "100",
        Interpretation:     "เผาผลาญพลังงานไม่เพียงพอ",
        Suggestion:         "ควรทำกิจกรรม หรือเคลื่อนไหวร่างกาย",
        HealthDataID:       2,
        RiskLevelID:        lBad.ID, 
	}
    healthAnalysis11 := entity.HealthAnalysis{
        Category:           "ออกซิเจนในเลือด",
        Value:              "90 %",
        Interpretation:     "ออกซิเจนในเลือดต่ำ",
        Suggestion:         "ควรปรึกษาและพบแพทย์",
        HealthDataID:       2,
        RiskLevelID:        lBad.ID, 
	}
    healthAnalysis12 := entity.HealthAnalysis{
        Category:           "อุณหภูมิร่างกาย",
        Value:              "39.5°C",
        Interpretation:     "ไข้สูง",
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
    

    //Trends
    var trend1, trend2, trend3 entity.Trends
    trend := []entity.Trends{
        {Trend: "ดีขึ้น"},
        {Trend: "คงที่"},
        {Trend: "แย่ลง"},
    }
    for i, ttrend := range trend {
        db.FirstOrCreate(&trend[i], entity.Trends{Trend: ttrend.Trend})
    }
    trend1 = trend[0]
    trend2 = trend[1]
    trend3 = trend[2]


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
        UserID:         2,	
        TrendsID:       trend1.ID,
        RiskLevelID:    lNormal.ID,
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
        UserID:         3,	
        TrendsID:       trend2.ID,
        RiskLevelID:    lGood.ID,
	}
    healthSum3 := entity.HealthSummary{
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
        UserID:         3,	
        TrendsID:       trend3.ID,
        RiskLevelID:    lBad.ID,
	}

	db.Create(&healthSum1)
	db.Create(&healthSum2)
    db.Create(&healthSum3)


    // NotificatonStatus
    var statusRead, statusUnread, statusArchived entity.NotificationStatus
    notiStatus := []entity.NotificationStatus{
        {Status: "อ่านแล้ว"},
        {Status: "ยังไม่อ่าน"},
        {Status: "เก็บถาวร"},
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
        {Type: "ปลอดภัย"},
        {Type: "เตือน"},
        {Type: "อันตราย"},
    }
    for i, htype := range healthTypes {
        db.FirstOrCreate(&healthTypes[i], entity.HealthType{Type: htype.Type})
    }
    htSafe = healthTypes[0]
    htWarning = healthTypes[1]
    htDanger = healthTypes[2]

    
    // Notifications
    // user id = 2
	noti1 := entity.Notification{
		Timestamp:              time.Now().Add(-12 * time.Hour),
        Title:                  "การนอนมากเกินไป",
		Message:                "คุณนอนหลับมากเกินไป ควรปรับการนอน",
		UserID:                 2,
		HealthTypeID:           htWarning.ID,
		NotificationStatusID:   statusArchived.ID,
        HealthAnalysisID:       &healthAnalysis3.HealthDataID,
        //TrendsID:               trend3.ID,
	}
	noti2 := entity.Notification{
		Timestamp:              time.Now().Add(-2 * time.Hour),
        Title:                  "การเผาผลาญแคลอรีต่ำเกินไป",
		Message:                "การเผาผลาญพลังงานมากขึ้น แต่ก็ยังน้อยอยู่ ควรออกกำลังกายหรือเคลื่อนไหวร่างกายให้มากขึ้นกว่านี้",
		UserID:                 2,
		HealthTypeID:           htWarning.ID,
		NotificationStatusID:   statusRead.ID,
        HealthAnalysisID:       &healthAnalysis4.HealthDataID,
        //TrendsID:               trend1.ID,
	}
    noti3 := entity.Notification{
		Timestamp:               time.Now(),
        Title:                  "สรุปสุขภาพประจำสัปดาห์ (วันที่ 1-7 กันยายน 2568)",
		Message:                "สุขภาพโดยรวมของคุณในเดือนนี้อยู่ในขั้นดี และดีขึ้นกว่าเดือนที่แล้ว",
		UserID:                 2,
		HealthTypeID:           htSafe.ID,
		NotificationStatusID:   statusUnread.ID,
        HealthSummaryID:        &healthSum1.ID,
        //TrendsID:               trend1.ID,
	}
    // user id = 3
    noti4 := entity.Notification{
		Timestamp:              time.Now().Add(-2 * time.Hour),
        Title:                  "ยังไม่บรรลุเป้าหมายก้าวเดิน",
		Message:                "วันนี้คุณยังเดินไม่ถึงเป้าที่ตั้งไว้",
		UserID:                 3,
		HealthTypeID:           htWarning.ID,
		NotificationStatusID:   statusUnread.ID,
        HealthAnalysisID:       &healthAnalysis8.HealthDataID,
        //TrendsID:               trend2.ID,
	}
    noti5 := entity.Notification{
		Timestamp:              time.Now().Add(-12 * time.Hour),
        Title:                  "การนอนหลับไม่เพียงพอ",
		Message:                "พักผ่อนไม่เพียงพอ ควรนอนให้มากขึ้น",
		UserID:                 3,
		HealthTypeID:           htDanger.ID,
		NotificationStatusID:   statusUnread.ID,
        HealthAnalysisID:       &healthAnalysis9.HealthDataID,
        //TrendsID:               trend2.ID,
	}
    noti6 := entity.Notification{
		Timestamp:              time.Now().Add(-12 * time.Hour),
        Title:                  "การเผาผลาญแคลอรีต่ำเกินไป",
		Message:                "การเผาผลาญพลังงานต่ำอยู่เสมอ ควรออกกำลังกายมากขึ้น",
		UserID:                 3,
		HealthTypeID:           htWarning.ID,
		NotificationStatusID:   statusUnread.ID,
        HealthAnalysisID:       &healthAnalysis10.HealthDataID,
        //TrendsID:               trend2.ID,
	}
    noti7 := entity.Notification{
		Timestamp:              time.Now().Add(-6 * time.Hour),
        Title:                  "ระดับออกซิเจนในเลือดต่ำ",
		Message:                "ออกซิเจนต่ำลง เข้าขั้นวิกฤติ รีบพบแพทย์โดยด่วน",
		UserID:                 3,
		HealthTypeID:           htDanger.ID,
		NotificationStatusID:   statusUnread.ID,
        HealthAnalysisID:       &healthAnalysis11.HealthDataID,
        //TrendsID:               trend3.ID,
	}
    noti8 := entity.Notification{
		Timestamp:              time.Now().Add(-2 * time.Hour),
        Title:                  "ไข้สูง",
		Message:                "ไข้สูง ควรพบแพทย์ และพักผ่อน",
		UserID:                 3,
		HealthTypeID:           htDanger.ID,
		NotificationStatusID:   statusUnread.ID,
        HealthAnalysisID:       &healthAnalysis12.HealthDataID,
        //TrendsID:               trend3.ID,
	}
    noti9 := entity.Notification{
		Timestamp:              time.Now(),
        Title:                  "สรุปสุขภาพประจำสัปดาห์ (วันที่ 1-7 กันยายน 2568)",
		Message:                "สุขภาพโดยรวมของคุณในเดือนนี้อยู่ในขั้นอันตราย และแย่ลงกว่าเดือนที่แล้ว",
		UserID:                 3,
		HealthTypeID:           htDanger.ID,
		NotificationStatusID:   statusUnread.ID,
        HealthSummaryID:        &healthSum2.ID,
        //TrendsID:               trend3.ID,
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



    //Article
    article1 := entity.Article{
		Title:          "เคล็ดลับดูแลสุขภาพหัวใจ",
        Information:    "การออกกำลังกายเป็นประจำ และการควบคุมอาหารสามารถช่วยลดความเสี่ยงโรคหัวใจได้",
		Reference:      "กรมอนามัย",
        Image:          "uploads/Articles/article1.jpeg",
        Published:      false,
		UserID:         5,
	
	}
    article2 := entity.Article{
		Title:          "วิธีลดน้ำตาลในชีวิตประจำวัน",
		Information:    "หลีกเลี่ยงเครื่องดื่มหวานและขนมขบเคี้ยวที่มีน้ำตาลสูง ช่วยควบคุมน้ำหนักและสุขภาพโดยรวม",
		Reference:      "สมาคมโภชนาการ",
        Image:          "uploads/Articles/article2.jpeg",
        Published:      false,
		UserID:         4,
	
	}
    article3 := entity.Article{
		Title:          "อาหารที่ช่วยเสริมภูมิคุ้มกัน",
		Information:    "ผักผลไม้หลากสี และอาหารที่มีวิตามินซี ช่วยเพิ่มภูมิคุ้มกันและลดความเสี่ยงการเจ็บป่วย",
		Reference:      "กรมอนามัย",
        Image:          "uploads/Articles/article3.jpeg",
        Published:      false,
		UserID:         5,
	
	}
    article4 := entity.Article{
		Title:          "การนอนหลับให้เพียงพอ",
		Information:    "ผู้ใหญ่ควรนอนวันละ 7–8 ชั่วโมง การนอนเพียงพอช่วยฟื้นฟูร่างกายและเพิ่มสมาธิ",
		Reference:      "สถาบันสุขภาพแห่งชาติ",
        Image:          "uploads/Articles/article4.jpeg",
        Published:      false,
		UserID:         4,
	
	}
    t := time.Now().AddDate(0, 0, -2) // 2 วันที่แล้ว
    article5 := entity.Article{
		Title:          "ออกกำลังกายง่าย ๆ ที่บ้าน",
		Information:    "การเดิน ยกน้ำหนักเบา หรือโยคะสั้น ๆ วันละ 20–30 นาที ช่วยเพิ่มความแข็งแรงของร่างกาย",
		Reference:      "สมาคมกีฬาสาธารณะ",
        Image:          "uploads/Articles/article5.jpeg",
        PublishDate:    &t,
        Published:      true,
		UserID:         4,
	
	}
    
    // user id = 4 (admin)
	db.Create(&article1)
	db.Create(&article2)
	db.Create(&article3)
	db.Create(&article4)
	db.Create(&article5)
}
