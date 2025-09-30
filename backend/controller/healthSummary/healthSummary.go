package healthSummary

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	appConfig "github.com/JanisataMJ/WebApp/config"
	"github.com/JanisataMJ/WebApp/controller/healthData"
	"github.com/JanisataMJ/WebApp/entity"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// HealthSummaryResponse 💡 Struct สำหรับส่งข้อมูลกลับทาง API (GetWeeklySummary)
type HealthSummaryResponse struct {
	PeriodStart string  `json:"period_start"`
	PeriodEnd   string  `json:"period_end"`
	AvgBpm      float64 `json:"avg_bpm"`
	MinBpm      uint    `json:"min_bpm"`
	MaxBpm      uint    `json:"max_bpm"`
	AvgSteps    float64 `json:"avg_steps"`
	TotalSteps  int64   `json:"total_steps"`
	AvgSleep    float64 `json:"avg_sleep"`
	AvgCalories float64 `json:"avg_calories"`
	AvgSpo2     float64 `json:"avg_spo2"`
	WeekNumber  uint    `json:"week_number"`
	RiskLevel   string  `json:"risk_level"`
}

// ----------------------------------------------------
// 💡 Utility Function
// ----------------------------------------------------

// ParseSleepHours แปลง "7 h. 30 m." เป็น 7.5
func ParseSleepHours(s string) float64 {
	if s == "" {
		return 0.0
	}

	parts := strings.FieldsFunc(s, func(r rune) bool {
		return r == 'h' || r == 'm' || r == '.' || r == ' '
	})

	var h, m float64
	if len(parts) >= 1 {
		hStr := strings.TrimSpace(parts[0])
		hVal, err := strconv.ParseFloat(hStr, 64)
		if err == nil {
			h = hVal
		}
	}

	if len(parts) >= 2 {
		mStr := strings.TrimSpace(parts[1])
		mVal, err := strconv.ParseFloat(mStr, 64)
		if err == nil {
			m = mVal
		}
	}

	return h + (m / 60.0)
}

// ----------------------------------------------------
// ✅ Core Logic: Calculate Summary
// ----------------------------------------------------

// CalculateSummary ดึง HealthData ตามช่วงเวลาและคำนวณค่าเฉลี่ย
func CalculateSummary(db *gorm.DB, userID string, startDate, endDate time.Time) (HealthSummaryResponse, error) {
	var healthDatas []entity.HealthData

	// 💡 ปรับให้ค้นหาตาม UserID และช่วงเวลา
	if err := db.Where("user_id = ? AND timestamp BETWEEN ? AND ?", userID, startDate, endDate).
		Find(&healthDatas).Error; err != nil {
		return HealthSummaryResponse{}, fmt.Errorf("failed to fetch health data: %w", err)
	}

	if len(healthDatas) == 0 {
		return HealthSummaryResponse{}, fmt.Errorf("no health data found for summary period")
	}

	var totalSleep, totalBpm, totalCalories, totalSpo2 float64
	var totalSteps int64
	var minBpm, maxBpm uint = 300, 0 // กำหนดค่าเริ่มต้นเพื่อให้ Min/Max ทำงานถูกต้อง

	for i, hd := range healthDatas {
		// การคำนวณ MinBpm, MaxBpm ต้องตรวจสอบเฉพาะค่าที่มีความหมาย (Bpm > 0)
		if hd.Bpm > 0 {
			if i == 0 || hd.Bpm < minBpm {
				minBpm = hd.Bpm
			}
			if hd.Bpm > maxBpm {
				maxBpm = hd.Bpm
			}
		}

		totalSleep += ParseSleepHours(hd.SleepHours)
		totalBpm += float64(hd.Bpm)
		totalSteps += hd.Steps
		totalCalories += hd.CaloriesBurned
		totalSpo2 += hd.Spo2
	}

	count := float64(len(healthDatas))
	avgSleep := totalSleep / count
	avgBpm := totalBpm / count
	avgSteps := float64(totalSteps) / count
	avgCalories := totalCalories / count
	avgSpo2 := totalSpo2 / count

	_, weekNum := startDate.ISOWeek()

	// ดึง RiskLevel ล่าสุด (ใช้ในการแสดงผล API)
	var healthSummary entity.HealthSummary
	riskLevelStr := "ไม่ระบุ"
	if err := db.Preload("RiskLevel").
		Where("user_id = ? AND period_start <= ?", userID, time.Now()). // หา Summary ล่าสุด
		Order("period_start DESC").
		First(&healthSummary).Error; err == nil && healthSummary.RiskLevel.Rlevel != "" {
		riskLevelStr = healthSummary.RiskLevel.Rlevel
	}

	result := HealthSummaryResponse{
		PeriodStart: startDate.Format("2006-01-02"),
		PeriodEnd:   endDate.Format("2006-01-02"),
		AvgBpm:      avgBpm,
		MinBpm:      minBpm,
		MaxBpm:      maxBpm,
		TotalSteps:  totalSteps,
		AvgSteps:    avgSteps,
		AvgSleep:    avgSleep,
		AvgCalories: avgCalories,
		AvgSpo2:     avgSpo2,
		WeekNumber:  uint(weekNum),
		RiskLevel:   riskLevelStr,
	}

	return result, nil
}

// ----------------------------------------------------
// ✅ Service Function: Create & Update Summary (สำหรับ Import Job)
// ----------------------------------------------------

// CreateWeeklySummaries สร้างหรืออัปเดต HealthSummary รายสัปดาห์ล่าสุดใน DB
// 💡 ฟังก์ชันนี้จะถูกเรียกใช้หลังจากการ Import/Analysis เสร็จสิ้น
func CreateWeeklySummaries(db *gorm.DB, userID string) {
	// 1. กำหนดช่วงเวลาที่ต้องการสร้าง Summary (สัปดาห์ที่แล้ว)
	today := time.Now()

	// หาสัปดาห์ที่แล้ว (เริ่มวันจันทร์, จบวันอาทิตย์)
	weekday := int(today.Weekday())
	if weekday == 0 {
		weekday = 7
	} // Sunday = 7

	// ตั้งเวลา EndDate เป็น 23:59:59 ของวันอาทิตย์ที่แล้ว
	endOfLastWeek := time.Date(today.Year(), today.Month(), today.Day(), 23, 59, 59, 0, today.Location()).AddDate(0, 0, -weekday)
	// ตั้งเวลา StartDate เป็น 00:00:00 ของวันจันทร์ที่แล้ว
	startOfLastWeek := time.Date(endOfLastWeek.Year(), endOfLastWeek.Month(), endOfLastWeek.Day(), 0, 0, 0, 0, endOfLastWeek.Location()).AddDate(0, 0, -6)

	// 💡 เพิ่ม Log เพื่อตรวจสอบช่วงเวลา
	fmt.Printf("Attempting to create summary for User: %s, Period: %s to %s\n", userID, startOfLastWeek.Format("2006-01-02"), endOfLastWeek.Format("2006-01-02"))

	// 2. คำนวณ Summary
	summaryData, err := CalculateSummary(db, userID, startOfLastWeek, endOfLastWeek)

	if err != nil {
		// 💡 หากมี Error จะหยุดทำงานตรงนี้
		fmt.Printf("Warning: Skipping summary creation for User %s: %v\n", userID, err)
		return // ⚠️ หาก err คือ "no health data found for summary period" แสดงว่าช่วงเวลาผิด
	}

	// 3. เตรียม RiskLevelID (ต้องดึงค่า ID ที่ถูกต้องจาก DB)
	var lNormal entity.RiskLevel
	// ⚠️ ตรวจสอบ Error ในการค้นหา RiskLevel
	if err := db.First(&lNormal, "rlevel = ?", "ปกติ").Error; err != nil {
		fmt.Printf("Error: Could not find RiskLevel 'ปกติ'. Please run seed data. %v\n", err)
		return // หยุดทำงานถ้าหา RiskLevel ไม่เจอ
	}

	// แปลง string userID เป็น uint
	userIDUint, err := strconv.ParseUint(userID, 10, 32)
	if err != nil {
		fmt.Printf("Error: Invalid User ID provided: %v\n", err)
		return
	}

	// 4. สร้าง Entity สำหรับบันทึก/อัปเดต
	summaryEntity := entity.HealthSummary{
		PeriodStart: startOfLastWeek,
		PeriodEnd:   endOfLastWeek,
		AvgBpm:      summaryData.AvgBpm,
		MinBpm:      summaryData.MinBpm,
		MaxBpm:      summaryData.MaxBpm,
		AvgSteps:    summaryData.AvgSteps,
		TotalSteps:  int(summaryData.TotalSteps), // แปลงกลับเป็น int
		AvgSleep:    summaryData.AvgSleep,
		AvgCalories: summaryData.AvgCalories,
		AvgSpo2:     summaryData.AvgSpo2,
		WeekNumber:  summaryData.WeekNumber,
		UserID:      uint(userIDUint),
		RiskLevelID: lNormal.ID, // ใช้ ID ที่ดึงมา
		TrendsID:    1,          // ตั้งค่าเริ่มต้น
	}

	// 5. บันทึก/อัปเดต HealthSummary (Upsert Logic)
	var existingSummary entity.HealthSummary
	// ค้นหา Summary ของ User และช่วงเวลาที่ตรงกัน
	result := db.Where("user_id = ? AND period_start = ?", summaryEntity.UserID, summaryEntity.PeriodStart).First(&existingSummary)

	if result.Error == gorm.ErrRecordNotFound {
		if createErr := db.Create(&summaryEntity).Error; createErr != nil {
			fmt.Printf("GORM ERROR on CREATE Summary: %v\n", createErr)
		} else {
			fmt.Println("SUCCESS: New HealthSummary record created.") // 💡 ยืนยัน
		}
	} else {
		if updateErr := db.Model(&existingSummary).Updates(summaryEntity).Error; updateErr != nil {
			fmt.Printf("GORM ERROR on UPDATE Summary: %v\n", updateErr)
		} else {
			fmt.Println("SUCCESS: Existing HealthSummary record updated.") // 💡 ยืนยัน
		}
	}
}

// ----------------------------------------------------
// 🌐 API Handlers (RESTful Endpoints)
// ----------------------------------------------------

// GET /health-summary
func ListHealthSummary(c *gin.Context) {
	var summary []entity.HealthSummary

	// โหลดพร้อม Preload User และ RiskLevel
	if err := appConfig.DB().
		Preload("User").
		Preload("RiskLevel").
		Find(&summary).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, summary)
}

// GET /health-summary/:id
func GetHealthSummary(c *gin.Context) {
	id := c.Param("id")
	summaryID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid ID"})
		return
	}

	var summary entity.HealthSummary

	// โหลดพร้อม Preload User, Notification, RiskLevel
	if err := appConfig.DB().
		Preload("User").
		Preload("Notification").
		Preload("RiskLevel").
		First(&summary, summaryID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "HealthSummary not found"})
		return
	}

	c.JSON(http.StatusOK, summary)
}

// อยู่ใน package healthData หรือ entity
type DailyData struct {
	Date       string  `json:"date"`
	AvgBpm     float64 `json:"avg_bpm"`
	Steps      int64   `json:"steps"`
	SleepHours string  `json:"sleep_hours"`
	Calories   float64 `json:"calories"`
	AvgSpo2    float64 `json:"avg_spo2"`
}

func GetWeeklySummary(c *gin.Context) {
	userID := c.Param("id")
	mode := c.DefaultQuery("mode", "weekly") // weekly | lastweek | last2weeks

	db := c.MustGet("db").(*gorm.DB)

	var internalData []healthData.DailyData
	var err error

	switch mode {
	case "weekly":
		internalData, err = healthData.GetWeeklyHealthDataInternal(db, userID, "weekly")
	case "lastweek":
		internalData, err = healthData.GetWeeklyHealthDataInternal(db, userID, "lastweek")
	case "last2weeks":
		internalData, err = healthData.GetWeeklyHealthDataInternal(db, userID, "last2weeks")
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid mode"})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// แปลง type
	dailyData := make([]DailyData, len(internalData))
	for i, d := range internalData {
		dailyData[i] = DailyData{
			Date:       d.Date,
			AvgBpm:     d.AvgBpm,
			Steps:      d.Steps,
			SleepHours: d.SleepHours,
			Calories:   d.Calories,
			AvgSpo2:    d.AvgSpo2,
		}
	}

	if len(dailyData) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "No health data found"})
		return
	}

	// คำนวณ summary เหมือนเดิม
	var sumBpm, sumSpo2, sumCalories float64
	var sumSteps int64
	var totalSleepMinutes int64
	var sleepCount int64

	for _, d := range dailyData {
		sumBpm += d.AvgBpm
		sumSpo2 += d.AvgSpo2
		sumCalories += d.Calories
		sumSteps += d.Steps

		if d.SleepHours != "" {
			var h, m int64
			fmt.Sscanf(d.SleepHours, "%dh %dm", &h, &m)
			totalSleepMinutes += h*60 + m
			sleepCount++
		}
	}

	count := float64(len(dailyData))
	avgBpm := sumBpm / count
	avgSpo2 := sumSpo2 / count
	avgCalories := sumCalories / count

	var avgSleep string
	if sleepCount > 0 {
		minutes := totalSleepMinutes / sleepCount
		h := minutes / 60
		m := minutes % 60
		avgSleep = fmt.Sprintf("%dh %dm", h, m)
	} else {
		avgSleep = "0h 0m"
	}

	summary := map[string]interface{}{
		"avg_bpm":      avgBpm,
		"avg_spo2":     avgSpo2,
		"total_steps":  sumSteps,
		"avg_calories": avgCalories,
		"avg_sleep":    avgSleep,
	}

	c.JSON(http.StatusOK, summary)
}

// ----------------------------------------------------
// ✅ Public Service Function for Job Runner (main.go)
// ----------------------------------------------------

// CreateSummariesForAllRecentUsers ดึง UserID ทั้งหมดจาก HealthData และสร้าง HealthSummary รายสัปดาห์ให้ทีละคน
// 💡 ฟังก์ชันนี้ถูกออกแบบมาเพื่อเรียกใช้ใน Job/Scheduler (เช่น ใน main.go)
func CreateSummariesForAllRecentUsers(db *gorm.DB) {
	var distinctUserIDs []uint

	// 1. ดึง UserID ที่ไม่ซ้ำกันทั้งหมดจาก HealthData ที่มีการบันทึกไว้
	//    ใช้ Pluck เพื่อดึงคอลัมน์ user_id เท่านั้น (รวดเร็วกว่า)
	result := db.Model(&entity.HealthData{}).
		Distinct().
		Pluck("user_id", &distinctUserIDs)

	if result.Error != nil {
		fmt.Printf("Error fetching distinct user IDs: %v\n", result.Error)
		return
	}

	if len(distinctUserIDs) == 0 {
		fmt.Println("No distinct users found in HealthData table to generate HealthSummary.")
		return
	}

	fmt.Printf("Starting HealthSummary creation for %d distinct user(s)...\n", len(distinctUserIDs))

	// 2. วนลูปเรียก CreateWeeklySummaries สำหรับ User แต่ละคน
	for _, userID := range distinctUserIDs {
		userIDStr := strconv.Itoa(int(userID))

		// เรียกใช้ฟังก์ชันหลักในการคำนวณและบันทึก
		CreateWeeklySummaries(db, userIDStr)
	}

	fmt.Println("✅ All weekly Health Summaries checked/updated.")
}

// ----------------------------------------------------
// ✅ Backfill Service Function (สำหรับสร้าง Summary ย้อนหลัง)
// ----------------------------------------------------

// BackfillAllWeeklySummaries สร้าง HealthSummary ย้อนหลังไปจนถึงสัปดาห์แรกที่มีข้อมูล
func BackfillAllWeeklySummaries(db *gorm.DB, userID string) {
	var firstRecord entity.HealthData

	// 1. ค้นหาวันที่เก่าที่สุดของข้อมูล User นี้
	err := db.Where("user_id = ?", userID).Order("timestamp ASC").Limit(1).First(&firstRecord).Error
	if err != nil {
		fmt.Printf("Warning: No health data found for user %s to backfill: %v\n", userID, err)
		return
	}

	// 2. กำหนดช่วงเวลาเริ่มต้นและสิ้นสุด

	// หาวันจันทร์ของสัปดาห์ที่เก่าสุด
	oldestDate := firstRecord.Timestamp
	weekday := int(oldestDate.Weekday())
	if weekday == 0 {
		weekday = 7 // Sunday is the 7th day
	}
	// startOfFirstWeek คือ วันจันทร์ 00:00:00 ของสัปดาห์ที่มีข้อมูลเก่าสุด
	startOfFirstWeek := oldestDate.AddDate(0, 0, -(weekday - 1)).Truncate(24 * time.Hour)

	// กำหนดช่วงเวลาเริ่มต้นในการวนลูป: วันจันทร์ของสัปดาห์ปัจจุบัน (หรือสัปดาห์ที่ผ่านมา)
	today := time.Now()
	todayWeekday := int(today.Weekday())
	if todayWeekday == 0 {
		todayWeekday = 7
	}
	// เริ่มจากวันจันทร์ของสัปดาห์ปัจจุบัน (เพื่อย้อนกลับไป)
	currentStart := today.AddDate(0, 0, -(todayWeekday - 1)).Truncate(24 * time.Hour)

	count := 0

	// 3. วนลูปย้อนหลังไปทีละสัปดาห์
	// วนลูปจนกว่าวันเริ่มต้นของสัปดาห์ (currentStart) จะก่อนวันเริ่มต้นของสัปดาห์แรก (startOfFirstWeek)
	for currentStart.After(startOfFirstWeek) || currentStart.Equal(startOfFirstWeek) {

		// กำหนด Period End ให้เป็นวันอาทิตย์ 23:59:59 ของสัปดาห์นั้น
		endDate := currentStart.AddDate(0, 0, 6).Add(23*time.Hour + 59*time.Minute + 59*time.Second)
		startDate := currentStart

		// 4. คำนวณและบันทึก Summary สำหรับช่วงเวลา (startDate - endDate)
		summaryData, err := CalculateSummary(db, userID, startDate, endDate)

		if err == nil {
			// Logic การบันทึก/อัปเดต (Upsert)
			var lNormal entity.RiskLevel
			if err := db.First(&lNormal, "rlevel = ?", "ปกติ").Error; err != nil {
				// หากหา RiskLevel ไม่เจอ ให้ Log แล้วข้าม
				fmt.Printf("Error: Could not find RiskLevel 'ปกติ'. Please run seed data. %v\n", err)
				currentStart = currentStart.AddDate(0, 0, -7) // เลื่อนไปสัปดาห์ถัดไป
				continue
			}

			userIDUint, _ := strconv.ParseUint(userID, 10, 32)

			summaryEntity := entity.HealthSummary{
				PeriodStart: startDate,
				PeriodEnd:   endDate,
				AvgBpm:      summaryData.AvgBpm,
				MinBpm:      summaryData.MinBpm,
				MaxBpm:      summaryData.MaxBpm,
				AvgSteps:    summaryData.AvgSteps,
				TotalSteps:  int(summaryData.TotalSteps),
				AvgSleep:    summaryData.AvgSleep,
				AvgCalories: summaryData.AvgCalories,
				AvgSpo2:     summaryData.AvgSpo2,
				WeekNumber:  summaryData.WeekNumber,
				UserID:      uint(userIDUint),
				RiskLevelID: lNormal.ID,
				TrendsID:    1,
			}

			var existingSummary entity.HealthSummary
			result := db.Where("user_id = ? AND period_start = ?", summaryEntity.UserID, summaryEntity.PeriodStart).First(&existingSummary)

			if result.Error == gorm.ErrRecordNotFound {
				if createErr := db.Create(&summaryEntity).Error; createErr != nil {
					fmt.Printf("GORM ERROR on BACKFILL CREATE Summary (%s): %v\n", startDate.Format("2006-01-02"), createErr)
				} else {
					fmt.Printf("SUCCESS: Backfill HealthSummary created for User %s, Week %s.\n", userID, startDate.Format("2006-01-02"))
					count++
				}
			} else {
				if updateErr := db.Model(&existingSummary).Updates(summaryEntity).Error; updateErr != nil {
					fmt.Printf("GORM ERROR on BACKFILL UPDATE Summary (%s): %v\n", startDate.Format("2006-01-02"), updateErr)
				} else {
					fmt.Printf("SUCCESS: Backfill HealthSummary updated for User %s, Week %s.\n", userID, startDate.Format("2006-01-02"))
					count++
				}
			}
		} else {
			fmt.Printf("Warning: Skipping Backfill for User %s, Week starting %s: %v\n", userID, startDate.Format("2006-01-02"), err)
		}

		// 5. เลื่อนย้อนหลังไป 1 สัปดาห์
		currentStart = currentStart.AddDate(0, 0, -7)
	}

	fmt.Printf("✅ Backfill completed for user %s. %d summaries processed.\n", userID, count)
}

// ----------------------------------------------------
// ✅ Public Service Function for Job Runner (main.go)
// ----------------------------------------------------

// RunSummaryJob ดึง UserID ทั้งหมดจาก HealthData และเรียกใช้ฟังก์ชัน Summary ตามโหมดที่กำหนด
// 💡 แทนที่ CreateSummariesForAllRecentUsers ด้วยฟังก์ชันนี้
func RunSummaryJob(db *gorm.DB, isBackfill bool) {
	var distinctUserIDs []uint

	// 1. ดึง UserID ที่ไม่ซ้ำกันทั้งหมดจาก HealthData
	result := db.Model(&entity.HealthData{}).
		Distinct().
		Pluck("user_id", &distinctUserIDs)

	if result.Error != nil {
		fmt.Printf("Error fetching distinct user IDs: %v\n", result.Error)
		return
	}

	if len(distinctUserIDs) == 0 {
		fmt.Println("No distinct users found in HealthData table to generate HealthSummary.")
		return
	}

	if isBackfill {
		fmt.Printf("Starting FULL BACKFILL for %d distinct user(s)...\n", len(distinctUserIDs))
	} else {
		fmt.Printf("Starting WEEKLY Summary creation for %d distinct user(s) (Last Week)...\n", len(distinctUserIDs))
	}

	// 2. วนลูปเรียกฟังก์ชันที่เหมาะสม
	for _, userID := range distinctUserIDs {
		userIDStr := strconv.Itoa(int(userID))

		if isBackfill {
			// รัน Backfill: สร้าง Summary ย้อนหลังทุกสัปดาห์
			BackfillAllWeeklySummaries(db, userIDStr)
		} else {
			// รัน Weekly: สร้าง Summary เฉพาะสัปดาห์ที่แล้ว
			CreateWeeklySummaries(db, userIDStr)
		}
	}

	fmt.Println("✅ Summary Job completed.")
}
