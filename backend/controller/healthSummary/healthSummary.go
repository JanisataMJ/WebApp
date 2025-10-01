package healthSummary

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	appConfig "github.com/JanisataMJ/WebApp/config"
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
// 💡 Utility Functions
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

// StartOfWeek คำนวณวันเริ่มต้นสัปดาห์ (วันจันทร์) ที่ 00:00:00 UTC
// 💡 เพื่อความสอดคล้องกับ Time Zone ในฐานข้อมูล
func StartOfWeek(t time.Time) time.Time {
	t = t.In(time.UTC) // เปลี่ยนเป็น UTC ก่อนคำนวณ

	// Monday = 1, Sunday = 0. ปรับให้วันจันทร์เป็นวันที่ 0 ในการคำนวณ
	weekday := int(t.Weekday())
	if weekday == int(time.Sunday) {
		weekday = 7 // Sunday ให้ถือเป็นวันที่ 7
	}
	// ลบวันเพื่อให้ถึงวันจันทร์
	daysToSubtract := weekday - int(time.Monday)

	// Truncate เพื่อให้เป็น 00:00:00 UTC
	return t.AddDate(0, 0, -daysToSubtract).Truncate(24 * time.Hour)
}

// ----------------------------------------------------
// ✅ Core Logic: Calculate Summary
// ----------------------------------------------------

// CalculateSummary ดึง HealthData ตามช่วงเวลาและคำนวณค่าเฉลี่ย
func CalculateSummary(db *gorm.DB, userID string, startDate, endDate time.Time) (HealthSummaryResponse, error) {
	var healthDatas []entity.HealthData

	if err := db.Where("user_id = ? AND timestamp BETWEEN ? AND ?", userID, startDate, endDate).
		Find(&healthDatas).Error; err != nil {
		return HealthSummaryResponse{}, fmt.Errorf("failed to fetch health data: %w", err)
	}

	if len(healthDatas) == 0 {
		return HealthSummaryResponse{}, fmt.Errorf("no health data found for summary period")
	}

	type dailyAgg struct {
		latestSteps   int64
		totalBpm      float64
		totalSleep    float64
		totalCalories float64
		totalSpo2     float64
		countBpm      int
		latestTime    time.Time
	}

	dailyMap := make(map[string]*dailyAgg)

	for _, hd := range healthDatas {
		dateStr := hd.Timestamp.Format("2006-01-02")
		if _, exists := dailyMap[dateStr]; !exists {
			dailyMap[dateStr] = &dailyAgg{}
		}

		agg := dailyMap[dateStr]

		// Steps: เลือกค่า timestamp ล่าสุดของวัน
		if hd.Timestamp.After(agg.latestTime) {
			agg.latestSteps = hd.Steps
			agg.latestTime = hd.Timestamp
		}

		// คำนวณค่าอื่น ๆ
		if hd.Bpm > 0 {
			agg.totalBpm += float64(hd.Bpm)
			agg.countBpm++
		}

		agg.totalSleep += ParseSleepHours(hd.SleepHours)
		agg.totalCalories += hd.CaloriesBurned
		agg.totalSpo2 += hd.Spo2
	}

	var sumBpm, sumSleep, sumCalories, sumSpo2 float64
	var totalSteps int64
	var minBpm, maxBpm uint = 300, 0

	for _, agg := range dailyMap {
		if agg.countBpm > 0 {
			dailyAvgBpm := agg.totalBpm / float64(agg.countBpm)
			sumBpm += dailyAvgBpm

			if minBpm > 0 && uint(dailyAvgBpm) < minBpm {
				minBpm = uint(dailyAvgBpm)
			}
			if uint(dailyAvgBpm) > maxBpm {
				maxBpm = uint(dailyAvgBpm)
			}
		}

		sumSleep += agg.totalSleep / float64(agg.countBpm)
		sumCalories += agg.totalCalories / float64(agg.countBpm)
		sumSpo2 += agg.totalSpo2 / float64(agg.countBpm)

		// Steps: ผลรวมของทั้งสัปดาห์
		totalSteps += agg.latestSteps
	}

	dayCount := float64(len(dailyMap))
	avgBpm := sumBpm / dayCount
	avgSleep := sumSleep / dayCount
	avgCalories := sumCalories / dayCount
	avgSpo2 := sumSpo2 / dayCount

	_, weekNum := startDate.ISOWeek()

	var healthSummary entity.HealthSummary
	riskLevelStr := "ไม่ระบุ"
	if err := db.Preload("RiskLevel").
		Where("user_id = ? AND period_start <= ?", userID, endDate).
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
		AvgSteps:    0,
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
	today := time.Now().In(time.UTC) // 💡 ใช้ UTC เป็นหลัก

	// StartOfThisWeek คือวันจันทร์ 00:00:00 UTC ของสัปดาห์ปัจจุบัน
	startOfThisWeek := StartOfWeek(today)

	// StartOfLastWeek คือวันจันทร์ 00:00:00 UTC ของสัปดาห์ที่แล้ว
	startOfLastWeek := startOfThisWeek.AddDate(0, 0, -7)
	// EndOfLastWeek คือวันอาทิตย์ 23:59:59 UTC ของสัปดาห์ที่แล้ว
	endOfLastWeek := startOfLastWeek.AddDate(0, 0, 6).Add(23*time.Hour + 59*time.Minute + 59*time.Second)

	// 💡 Log แสดงช่วงเวลาที่เป็น UTC
	fmt.Printf("Attempting to create summary for User: %s, Period (UTC): %s to %s\n", userID, startOfLastWeek.Format("2006-01-02"), endOfLastWeek.Format("2006-01-02"))

	// 2. คำนวณ Summary
	summaryData, err := CalculateSummary(db, userID, startOfLastWeek, endOfLastWeek)

	if err != nil {
		fmt.Printf("Warning: Skipping summary creation for User %s: %v\n", userID, err)
		return
	}

	// 3. เตรียม RiskLevelID (ต้องดึงค่า ID ที่ถูกต้องจาก DB)
	var lNormal entity.RiskLevel
	// 🟢 FIX: ใช้ "r_level" เพื่อแก้ปัญหา "no such column"
	if err := db.Where("r_level = ?", "ปกติ").First(&lNormal).Error; err != nil {
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
		PeriodStart: startOfLastWeek, // 💡 สำคัญ: ใช้ UTC
		PeriodEnd:   endOfLastWeek,
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

	// 5. บันทึก/อัปเดต HealthSummary (Upsert Logic)
	var existingSummary entity.HealthSummary
	// ค้นหา Summary ของ User และช่วงเวลาที่ตรงกัน
	result := db.Where("user_id = ? AND period_start = ?", summaryEntity.UserID, summaryEntity.PeriodStart).First(&existingSummary)

	if result.Error == gorm.ErrRecordNotFound {
		if createErr := db.Create(&summaryEntity).Error; createErr != nil {
			fmt.Printf("GORM ERROR on CREATE Summary: %v\n", createErr)
		} else {
			fmt.Println("SUCCESS: New HealthSummary record created.")
		}
	} else {
		if result.Error != nil {
			fmt.Printf("GORM ERROR on querying existing Summary: %v\n", result.Error)
			return
		}

		if updateErr := db.Model(&existingSummary).Updates(summaryEntity).Error; updateErr != nil {
			fmt.Printf("GORM ERROR on UPDATE Summary: %v\n", updateErr)
		} else {
			fmt.Println("SUCCESS: Existing HealthSummary record updated.")
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

// ดึงข้อมูลไปแสดง
func GetWeeklySummary(c *gin.Context) {
	userID := c.Param("id")
	mode := c.DefaultQuery("mode", "weekly") // weekly | lastweek | last2weeks

	db := c.MustGet("db").(*gorm.DB)

	var summaries []entity.HealthSummary

	now := time.Now().UTC()
	startOfThisWeek := StartOfWeek(now) // วันจันทร์ของสัปดาห์นี้
	var startDate time.Time

	switch mode {
	case "weekly": // สัปดาห์นี้
		startDate = startOfThisWeek
	case "lastweek": // สัปดาห์ที่แล้ว
		startDate = startOfThisWeek.AddDate(0, 0, -7)
	case "last2weeks": // สัปดาห์ก่อนสัปดาห์ที่แล้ว
		startDate = startOfThisWeek.AddDate(0, 0, -14) // วันจันทร์ 2 สัปดาห์ก่อน
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid mode"})
		return
	}

	// ดึง HealthSummary จาก DB
	if err := db.Preload("RiskLevel").
		Where("user_id = ? AND period_start = ?", userID, startDate). // เลือกสัปดาห์ตรง ๆ
		Order("period_start ASC").
		Find(&summaries).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if len(summaries) == 0 {
		c.JSON(http.StatusOK, gin.H{
			"message":      "ไม่มีข้อมูลสรุปสำหรับ " + mode,
			"avg_bpm":      nil,
			"avg_spo2":     nil,
			"total_steps":  nil,
			"avg_calories": nil,
			"avg_sleep":    nil,
			"weeks":        []map[string]interface{}{},
		})
		return
	}

	// รวมค่า (จริง ๆ จะมีแค่ 1 สัปดาห์สำหรับ last2weeks)
	var sumBpm, sumSpo2, sumCalories, sumSleep float64
	var totalSteps int64
	weekData := make([]map[string]interface{}, 0, len(summaries))

	for _, s := range summaries {
		sumBpm += s.AvgBpm
		sumSpo2 += s.AvgSpo2
		sumCalories += s.AvgCalories
		sumSleep += s.AvgSleep
		totalSteps += int64(s.TotalSteps)

		weekData = append(weekData, map[string]interface{}{
			"period_start": s.PeriodStart.Format("2006-01-02"),
			"period_end":   s.PeriodEnd.Format("2006-01-02"),
			"avg_bpm":      s.AvgBpm,
			"avg_spo2":     s.AvgSpo2,
			"total_steps":  s.TotalSteps,
			"avg_calories": s.AvgCalories,
			"avg_sleep":    s.AvgSleep,
		})
	}

	dayCount := float64(len(summaries))
	summary := map[string]interface{}{
		"avg_bpm":      sumBpm / dayCount,
		"avg_spo2":     sumSpo2 / dayCount,
		"total_steps":  totalSteps,
		"avg_calories": sumCalories / dayCount,
		"avg_sleep":    sumSleep / dayCount,
		"weeks":        weekData,
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

	// 2. กำหนดช่วงเวลาเริ่มต้นและสิ้นสุด (ใช้ UTC ทั้งหมด)

	// StartOfFirstWeek: วันจันทร์ 00:00:00 UTC ของสัปดาห์ที่มีข้อมูลเก่าสุด
	startOfFirstWeek := StartOfWeek(firstRecord.Timestamp)

	// currentStart: วันจันทร์ 00:00:00 UTC ของสัปดาห์ปัจจุบัน (เพื่อย้อนกลับไป)
	currentStart := StartOfWeek(time.Now())

	count := 0

	// 3. วนลูปย้อนหลังไปทีละสัปดาห์
	for currentStart.After(startOfFirstWeek) || currentStart.Equal(startOfFirstWeek) {

		// กำหนด Period End ให้เป็นวันอาทิตย์ 23:59:59 UTC ของสัปดาห์นั้น
		startDate := currentStart
		endDate := currentStart.AddDate(0, 0, 6).Add(23*time.Hour + 59*time.Minute + 59*time.Second)

		// 4. คำนวณและบันทึก Summary สำหรับช่วงเวลา (startDate - endDate)
		summaryData, err := CalculateSummary(db, userID, startDate, endDate)

		if err == nil {
			// Logic การบันทึก/อัปเดต (Upsert)
			var lNormal entity.RiskLevel
			// 🟢 FIX: ใช้ "r_level" เพื่อแก้ปัญหา "no such column"
			if err := db.Where("rlevel = ?", "ปกติ").First(&lNormal).Error; err != nil {
				fmt.Printf("Error: Could not find RiskLevel 'ปกติ'. Please run seed data. %v\n", err)
				currentStart = currentStart.AddDate(0, 0, -7)
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
			// ค้นหา Summary ของ User และช่วงเวลาที่ตรงกัน
			// ⚠️ บรรทัดนี้ (เดิมคือ 490) คือที่ทำให้เกิด Log 'record not found' เมื่อไม่พบข้อมูล ซึ่งเป็นเรื่องปกติ
			result := db.Where("user_id = ? AND period_start = ?", summaryEntity.UserID, summaryEntity.PeriodStart).First(&existingSummary)

			if result.Error == gorm.ErrRecordNotFound {
				if createErr := db.Create(&summaryEntity).Error; createErr != nil {
					fmt.Printf("GORM ERROR on BACKFILL CREATE Summary (%s): %v\n", startDate.Format("2006-01-02"), createErr)
				} else {
					fmt.Printf("SUCCESS: Backfill HealthSummary created for User %s, Week %s.\n", userID, startDate.Format("2006-01-02"))
					count++
				}
			} else {
				if result.Error != nil {
					fmt.Printf("GORM ERROR on querying existing Summary for backfill: %v\n", result.Error)
					currentStart = currentStart.AddDate(0, 0, -7)
					continue
				}

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
