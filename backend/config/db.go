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

	// User 2 (ID=2)
	User2 := &entity.User{
		Username:    "Emily",
		Password:    hashedPassword,
		Email:       "user2@gmail.com",
		FirstName:   "Emily",
		LastName:    "Davis",
		Birthdate:   BirthDay,
		Phonenumber: "0861234567",
		Profile:     "uploads/Profiles/profile2.jpeg",
		Height:      166,
		Weight:      55,
		Bust:        33,
		Waist:       25,
		Hip:         37,
		RoleID:      2,
		GenderID:    2,
	}
	db.FirstOrCreate(User2, &entity.User{Email: "user2@gmail.com"})

	// User 3 (ID=3)
	UserEmail := &entity.User{
		Username:    "William",
		Password:    hashedPassword,
		Email:       "usercpe21@gmail.com",
		FirstName:   "William",
		LastName:    "Brown",
		Birthdate:   BirthDay,
		Phonenumber: "0925552121",
		Profile:     "uploads/Profiles/profile3.jpeg",
		Height:      177,
		Weight:      67,
		Bust:        40,
		Waist:       33,
		Hip:         35,
		RoleID:      2,
		GenderID:    1,
	}
	db.FirstOrCreate(UserEmail, &entity.User{Email: "usercpe21@gmail.com"})
    
    // Admin 1 (ID=4)
	Admin1 := &entity.User{
		Username:    "Admin1",
		Password:    hashedPassword,
		Email:       "admin1@gmail.com",
		FirstName:   "Olivia",
		LastName:    "Wilson",
		Birthdate:   BirthDay,
		Phonenumber: "0871914646",
		Profile:     "uploads/Profiles/profile4.jpeg",
		RoleID:      1,
		GenderID:    2,
	}
	db.FirstOrCreate(Admin1, &entity.User{Email: "admin1@gmail.com"})

    // Admin 2 (ID=5)
	Admin2 := &entity.User{
		Username:    "Admin2",
		Password:    hashedPassword,
		Email:       "admin2@gmail.com",
		FirstName:   "Michael",
		LastName:    "Johnson",
		Birthdate:   BirthDay,
		Phonenumber: "0642339911",
		Profile:     "uploads/Profiles/profile5.jpeg",
		RoleID:      1,
		GenderID:    1,
	}
	db.FirstOrCreate(Admin2, &entity.User{Email: "admin2@gmail.com"})

	User6 := &entity.User{
		Username:    "MaeMae",
		Password:    hashedPassword,
		Email:       "user6@gmail.com",
		FirstName:   "MaeMae",
		LastName:    "MaeMae",
		Birthdate:   BirthDay,
		Phonenumber: "0615871759",
		Profile:     "uploads/Profiles/profile2.jpeg",
		Height:      166,
		Weight:      55,
		Bust:        33,
		Waist:       25,
		Hip:         37,
		RoleID:      2,
		GenderID:    2,
	}
	db.FirstOrCreate(User6, &entity.User{Email: "user6@gmail.com"})

	// 5. Seed Data สำหรับ HealthData (สำคัญ: เพื่อรับประกันว่าจะมีข้อมูลให้วิเคราะห์ แม้การดึง Sheet จะไม่สำเร็จ)
	// HealthData ของ User 2
	healthDataSample1 := entity.HealthData{
		Timestamp:      time.Now(),
		Bpm:            79,
		Steps:          10000,
		SleepHours:     "8 h. 30 m.",
		CaloriesBurned: 550,
		Spo2:           98.0,
		UserID:         2,
	}
	db.FirstOrCreate(&healthDataSample1, entity.HealthData{Bpm: 79, UserID: 2})

	// HealthData ของ User 3
	healthDataSample2 := entity.HealthData{
		Timestamp:      time.Now().Add(-24 * time.Hour),
		Bpm:            120,
		Steps:          100,
		SleepHours:     "5 h. 0 m.",
		CaloriesBurned: 150,
		Spo2:           92.0,
		UserID:         3,
	}
	db.FirstOrCreate(&healthDataSample2, entity.HealthData{Bpm: 120, UserID: 3})

	// 6. RiskLevel (ต้องสร้างก่อน HealthAnalysis)
	Rlevels := []entity.RiskLevel{
		{Rlevel: "ดี"},
		{Rlevel: "ปกติ"},
		{Rlevel: "เสี่ยง"},
	}
	for i, level := range Rlevels {
		db.FirstOrCreate(&Rlevels[i], entity.RiskLevel{Rlevel: level.Rlevel})
	}
	
	// 7. Trends
	trend := []entity.Trends{
		{Trend: "ดีขึ้น"},
		{Trend: "คงที่"},
		{Trend: "แย่ลง"},
	}
	for i, ttrend := range trend {
		db.FirstOrCreate(&trend[i], entity.Trends{Trend: ttrend.Trend})
	}
    
    // 8. NotificatonStatus
	notiStatus := []entity.NotificationStatus{
		{Status: "อ่านแล้ว"},
		{Status: "ยังไม่อ่าน"},
		{Status: "เก็บถาวร"},
	}
	for i, status := range notiStatus {
		db.FirstOrCreate(&notiStatus[i], entity.NotificationStatus{Status: status.Status})
	}
    
    // 9. HealthType
	healthTypes := []entity.HealthType{
		{Type: "ปลอดภัย"},
		{Type: "เตือน"},
		{Type: "อันตราย"},
	}
	for i, htype := range healthTypes {
		db.FirstOrCreate(&healthTypes[i], entity.HealthType{Type: htype.Type})
	}

	// 10. Article
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

	db.Create(&article1)
	db.Create(&article2)
	db.Create(&article3)
	db.Create(&article4)
	db.Create(&article5)
    
    // ⚠️ สิ้นสุด SetupDatabase() - ไม่มีโค้ดวิเคราะห์ HealthAnalysis ตรงนี้
}