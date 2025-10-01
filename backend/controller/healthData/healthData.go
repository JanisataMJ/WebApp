package healthData

import (
	"gorm.io/gorm"
	"log"
	"net/http"
	"time"

	"github.com/JanisataMJ/WebApp/config"
	"github.com/JanisataMJ/WebApp/entity"
	"github.com/gin-gonic/gin"
)

// ListHealthData ดึงข้อมูลสุขภาพทั้งหมด (Endpoint)
// GET /list-healthData
func ListHealthData(c *gin.Context) {
	var data []entity.HealthData

	// preload User และ HealthAnalysis เฉพาะของ user
	if err := config.DB().
		Preload("User").
		Preload("HealthAnalysis").
		Preload("HealthAnalysis.RiskLevel").
		Find(&data).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, data)
}

// GetHealthDataByUserID ดึงข้อมูลสุขภาพทั้งหมดของ User (Endpoint)
// GET /healthData/:id
func GetHealthDataByUserID(c *gin.Context) {
	userID := c.Param("id")
	var data []entity.HealthData
	db := config.DB()

	result := db.Preload("User").
		Preload("HealthAnalysis").
		Preload("HealthAnalysis.RiskLevel").
		Where("user_id = ?", userID).
		Order("timestamp desc").
		Find(&data)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, data)
}

type DailyData struct {
	Date       string  `json:"date"`
	AvgBpm     float64 `json:"avg_bpm"`
	Steps      int64   `json:"steps"`
	SleepHours string  `json:"sleep_hours"`
	Calories   float64 `json:"calories"`
	AvgSpo2    float64 `json:"avg_spo2"`
}

// GetWeeklyHealthData ดึงข้อมูลสุขภาพรายวันในรอบสัปดาห์ (Endpoint)
// GET /healthData/weekly/:id?mode=weekly
func GetWeeklyHealthData(c *gin.Context) {
	db := c.MustGet("db").(*gorm.DB)
	userID := c.Param("id")
	mode := c.DefaultQuery("mode", "weekly") // weekly | lastweek | last2weeks

	// เรียกใช้ฟังก์ชัน Internal
	results, err := GetWeeklyHealthDataInternal(db, userID, mode)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, results)
}

// GetWeeklyHealthDataInternal ดึงข้อมูลสุขภาพรายสัปดาห์สำหรับ Backend (Internal Function)
// ใช้สำหรับเรียกจากฟังก์ชันอื่น เช่น HealthSummary หรือ HealthAnalysis
func GetWeeklyHealthDataInternal(db *gorm.DB, userID, mode string) ([]DailyData, error) {
	var healthData []entity.HealthData

	// 🟢 FIX 1: ใช้เวลาปัจจุบันในรูปแบบ UTC เพื่อให้สอดคล้องกับการจัดเก็บในฐานข้อมูล (ถ้าฐานข้อมูลใช้ UTC)
	today := time.Now().In(time.UTC)
	var startDate, endDate time.Time

	// คำนวณวันจันทร์ของสัปดาห์นี้ใน UTC
	// Go's Weekday: Sunday=0, Monday=1, ..., Saturday=6
	weekday := int(today.Weekday())
	dayOffset := int(time.Monday) - weekday // ถ้าเป็นจันทร์ (1) จะเป็น 0. ถ้าเป็นอาทิตย์ (0) จะเป็น 1
	if dayOffset > 0 {
		dayOffset -= 7 // หากเป็นวันจันทร์ถึงวันอาทิตย์ Go จะให้ค่า 0 ถึง 6.
		// หากเป็นวันอาทิตย์ (0), time.Monday(1) - 0 = 1, ต้องย้อน 6 วัน (1-7=-6)
		// การใช้: dayOffset := (int(time.Monday) - weekday + 7) % 7 // จะได้ 0..6
	}

	startOfThisWeek := today.AddDate(0, 0, dayOffset) // วันจันทร์ของสัปดาห์นี้

	// ปรับให้เป็น 00:00:00 ของวันจันทร์
	startOfThisWeek = time.Date(startOfThisWeek.Year(), startOfThisWeek.Month(), startOfThisWeek.Day(), 0, 0, 0, 0, time.UTC)

	switch mode {
	case "lastweek":
		// สัปดาห์ที่แล้ว: จันทร์ที่แล้ว - อาทิตย์ที่แล้ว
		startDate = startOfThisWeek.AddDate(0, 0, -7)
		endDate = startOfThisWeek.AddDate(0, 0, -1)
	case "last2weeks":
		// 2 สัปดาห์ก่อน: จันทร์ 2 สัปดาห์ก่อน - อาทิตย์ 2 สัปดาห์ก่อน
		startDate = startOfThisWeek.AddDate(0, 0, -14)
		endDate = startOfThisWeek.AddDate(0, 0, -8)
	default: // "weekly" (สัปดาห์นี้)
		// สัปดาห์นี้: จันทร์นี้ - วันอาทิตย์นี้
		startDate = startOfThisWeek
		endDate = startOfThisWeek.AddDate(0, 0, 6)
	}

	// 🟢 FIX 2: ตั้งเวลาให้เริ่มต้นและสิ้นสุดวันใน UTC เสมอ
	startDate = time.Date(startDate.Year(), startDate.Month(), startDate.Day(), 0, 0, 0, 0, time.UTC)
	// ตั้งเวลาสิ้นสุดที่ 23:59:59.999999999 เพื่อครอบคลุมทั้งวัน
	endDate = time.Date(endDate.Year(), endDate.Month(), endDate.Day(), 23, 59, 59, 999999999, time.UTC)

	// 🟢 เพิ่ม Log เพื่อตรวจสอบช่วงเวลาที่ใช้ Query
	log.Printf("DB Query Health Data - UserID: %s Mode: %s. Period: %s (UTC) to %s (UTC)", userID, mode, startDate.Format(time.RFC3339), endDate.Format(time.RFC3339))

	// ดึงข้อมูล
	if err := db.Where("user_id = ? AND timestamp BETWEEN ? AND ?", userID, startDate, endDate).
		Order("timestamp ASC").Find(&healthData).Error; err != nil {
		return nil, err
	}

	// 🟢 Log จำนวน Record ที่ดึงได้ (เพื่อยืนยันว่าได้ข้อมูลหรือไม่)
	log.Printf("DB Query Health Data - Records retrieved: %d", len(healthData))

	// Group by day (การจัดกลุ่มและคำนวณค่าเฉลี่ยยังคงเดิม)
	dailyMap := make(map[string][]entity.HealthData)
	for _, hd := range healthData {
		// ใช้วันที่ใน UTC เพื่อ Group
		day := hd.Timestamp.In(time.UTC).Format("2006-01-02")
		dailyMap[day] = append(dailyMap[day], hd)
	}

	// หลังจากที่คุณสร้าง dailyMap เสร็จแล้ว
	var results []DailyData

	for d := startDate; !d.After(endDate); d = d.AddDate(0, 0, 1) {
		dayStr := d.Format("2006-01-02")
		list, exists := dailyMap[dayStr]

		if !exists || len(list) == 0 {
			// ถ้าไม่มีข้อมูลในวันนั้น → ส่งค่า default
			results = append(results, DailyData{
				Date:       dayStr,
				AvgBpm:     0,
				Steps:      0,
				SleepHours: "",
				Calories:   0,
				AvgSpo2:    0,
			})
			continue
		}

		var sumBpm, sumSpo2 float64
		var lastSteps int64
		var lastCalories float64
		var lastSleep string

		for _, hd := range list {
			sumBpm += float64(hd.Bpm)
			sumSpo2 += hd.Spo2
			lastSteps = hd.Steps
			lastCalories = hd.CaloriesBurned
			if hd.SleepHours != "" {
				lastSleep = hd.SleepHours
			}
		}

		count := float64(len(list))
		results = append(results, DailyData{
			Date:       dayStr,
			AvgBpm:     sumBpm / count,
			Steps:      lastSteps,
			SleepHours: lastSleep,
			Calories:   lastCalories,
			AvgSpo2:    sumSpo2 / count,
		})
	}
	return results, nil
}