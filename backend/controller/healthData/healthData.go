package healthData

import (
	"gorm.io/gorm"
	"net/http"
	"sort"
	"time"

	"github.com/JanisataMJ/WebApp/config"
	"github.com/JanisataMJ/WebApp/entity"
	"github.com/gin-gonic/gin"
	//"github.com/JanisataMJ/WebApp/controller/healthAnalysis"
)

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

// GET /healthData/:id
// เหมาะสำหรับหน้า Dashboard หรือ ประวัติสุขภาพแบบละเอียด
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

// GET 	/healthData/weekly/6?mode=last7days
/* func GetWeeklyHealthData(c *gin.Context) {
	db := c.MustGet("db").(*gorm.DB)
	userID := c.Param("id")
	mode := c.DefaultQuery("mode", "weekly")

	today := time.Now()
	var startDate, endDate time.Time

	switch mode {
	case "last7days":
		startDate = today.AddDate(0, 0, -6)
		endDate = today
	case "lastweek":
		weekday := int(today.Weekday())
		if weekday == 0 {
			weekday = 7
		}
		startOfThisWeek := today.AddDate(0, 0, -(weekday - 1))
		endOfLastWeek := startOfThisWeek.AddDate(0, 0, -1)
		startDate = endOfLastWeek.AddDate(0, 0, -6)
		endDate = endOfLastWeek
	default:
		weekday := int(today.Weekday())
		if weekday == 0 {
			weekday = 7
		}
		startDate = today.AddDate(0, 0, -(weekday - 1))
		endDate = startDate.AddDate(0, 0, 6)

		startDate = time.Date(startDate.Year(), startDate.Month(), startDate.Day(), 0, 0, 0, 0, startDate.Location())
		endDate = time.Date(endDate.Year(), endDate.Month(), endDate.Day(), 23, 59, 59, 0, endDate.Location())
	}

	// ดึงข้อมูลของ user ตามช่วงเวลา
	var healthData []entity.HealthData
	if err := db.Where("user_id = ? AND timestamp BETWEEN ? AND ?", userID, startDate, endDate).
		Order("timestamp ASC").
		Find(&healthData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Group by day
	dailyMap := make(map[string][]entity.HealthData)
	for _, hd := range healthData {
		day := hd.Timestamp.Format("2006-01-02")
		dailyMap[day] = append(dailyMap[day], hd)
	}

	var results []DailyData
	for date, list := range dailyMap {
		var totalBpm, totalSpo2 float64
		var stepsLatest int64
		var caloriesLatest float64
		var sleepLatest string

		for _, hd := range list {
			// ค่าเฉลี่ยสำหรับ bpm และ spo2
			totalBpm += float64(hd.Bpm)
			totalSpo2 += hd.Spo2

			// เก็บค่าล่าสุดของวัน (เรียงจากเวลาแล้ว)
			if hd.SleepHours != "" {
				sleepLatest = hd.SleepHours
			}
			stepsLatest = hd.Steps
			caloriesLatest = hd.CaloriesBurned
		}

		count := float64(len(list))

		results = append(results, DailyData{
			Date:       date,
			AvgBpm:     totalBpm / count,  // เฉลี่ย
			Steps:      stepsLatest,       // ล่าสุด
			SleepHours: sleepLatest,       // ล่าสุด
			Calories:   caloriesLatest,    // ล่าสุด
			AvgSpo2:    totalSpo2 / count, // เฉลี่ย
		})
	}

	// เรียงวัน
	sort.Slice(results, func(i, j int) bool {
		return results[i].Date < results[j].Date
	})

	c.JSON(http.StatusOK, results)
}
 */
func GetWeeklyHealthData(c *gin.Context) {
	db := c.MustGet("db").(*gorm.DB)
	userID := c.Param("id")
	mode := c.DefaultQuery("mode", "weekly") // weekly | lastweek | last2weeks

	today := time.Now()
	var startDate, endDate time.Time

	// หาวันจันทร์ของสัปดาห์นี้
	weekday := int(today.Weekday())
	if weekday == 0 {
		weekday = 7
	}
	startOfThisWeek := today.AddDate(0, 0, -(weekday - 1))
	endOfThisWeek := startOfThisWeek.AddDate(0, 0, 6)

	switch mode {
	case "weekly":
		startDate = startOfThisWeek
		endDate = endOfThisWeek
	case "lastweek":
		startDate = startOfThisWeek.AddDate(0, 0, -7) // จันทร์สัปดาห์ที่แล้ว
		endDate = startOfThisWeek.AddDate(0, 0, -1)   // อาทิตย์สัปดาห์ที่แล้ว
	case "last2weeks":
		startDate = startOfThisWeek.AddDate(0, 0, -14) // จันทร์ 2 สัปดาห์ก่อน
		endDate = startOfThisWeek.AddDate(0, 0, -8)    // อาทิตย์ 2 สัปดาห์ก่อน
	default:
		startDate = startOfThisWeek
		endDate = endOfThisWeek
	}

	// ปรับเวลาให้เป็น 00:00:00 – 23:59:59
	startDate = time.Date(startDate.Year(), startDate.Month(), startDate.Day(), 0, 0, 0, 0, startDate.Location())
	endDate = time.Date(endDate.Year(), endDate.Month(), endDate.Day(), 23, 59, 59, 0, endDate.Location())

	// ดึงข้อมูลของ user ตามช่วงเวลา
	var healthData []entity.HealthData
	if err := db.Where("user_id = ? AND timestamp BETWEEN ? AND ?", userID, startDate, endDate).
		Order("timestamp ASC").
		Find(&healthData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Group by day
	dailyMap := make(map[string][]entity.HealthData)
	for _, hd := range healthData {
		day := hd.Timestamp.Format("2006-01-02")
		dailyMap[day] = append(dailyMap[day], hd)
	}

	var results []DailyData
	for date, list := range dailyMap {
		var totalBpm, totalSpo2 float64
		var stepsLatest int64
		var caloriesLatest float64
		var sleepLatest string

		for _, hd := range list {
			totalBpm += float64(hd.Bpm)
			totalSpo2 += hd.Spo2

			if hd.SleepHours != "" {
				sleepLatest = hd.SleepHours
			}
			stepsLatest = hd.Steps
			caloriesLatest = hd.CaloriesBurned
		}

		count := float64(len(list))
		results = append(results, DailyData{
			Date:       date,
			AvgBpm:     totalBpm / count,
			Steps:      stepsLatest,
			SleepHours: sleepLatest,
			Calories:   caloriesLatest,
			AvgSpo2:    totalSpo2 / count,
		})
	}

	sort.Slice(results, func(i, j int) bool {
		return results[i].Date < results[j].Date
	})

	c.JSON(http.StatusOK, results)
}


func GetWeeklyHealthDataInternal(db *gorm.DB, userID, mode string) ([]DailyData, error) {
	var healthData []entity.HealthData
	today := time.Now()
	var startDate, endDate time.Time

	weekday := int(today.Weekday())
	if weekday == 0 {
		weekday = 7 // Sunday = 7
	}

	switch mode {
	case "lastweek":
		// หาสัปดาห์ที่แล้ว
		startOfThisWeek := today.AddDate(0, 0, -(weekday - 1))
		endOfLastWeek := startOfThisWeek.AddDate(0, 0, -1)
		startDate = endOfLastWeek.AddDate(0, 0, -6) // วันจันทร์ที่แล้ว
		endDate = endOfLastWeek                       // วันอาทิตย์ที่แล้ว
	case "last2weeks":
		// หาสองสัปดาห์ก่อน
		startOfThisWeek := today.AddDate(0, 0, -(weekday - 1))
		endOfLastWeek := startOfThisWeek.AddDate(0, 0, -1)
		endOfTwoWeeksAgo := endOfLastWeek.AddDate(0, 0, -7)
		startDate = endOfTwoWeeksAgo.AddDate(0, 0, -6) // วันจันทร์สองสัปดาห์ก่อน
		endDate = endOfTwoWeeksAgo                       // วันอาทิตย์สองสัปดาห์ก่อน
	default: // "weekly"
		startDate = today.AddDate(0, 0, -(weekday - 1)) // วันจันทร์สัปดาห์นี้
		endDate = startDate.AddDate(0, 0, 6)           // วันอาทิตย์สัปดาห์นี้
	}

	// ตั้งเวลาให้เริ่มต้นและสิ้นสุดวัน
	startDate = time.Date(startDate.Year(), startDate.Month(), startDate.Day(), 0, 0, 0, 0, startDate.Location())
	endDate = time.Date(endDate.Year(), endDate.Month(), endDate.Day(), 23, 59, 59, 0, endDate.Location())

	// ดึงข้อมูล
	if err := db.Where("user_id = ? AND timestamp BETWEEN ? AND ?", userID, startDate, endDate).
		Order("timestamp ASC").Find(&healthData).Error; err != nil {
		return nil, err
	}

	// Group by day
	dailyMap := make(map[string][]entity.HealthData)
	for _, hd := range healthData {
		day := hd.Timestamp.Format("2006-01-02")
		dailyMap[day] = append(dailyMap[day], hd)
	}

	var results []DailyData
	for date, list := range dailyMap {
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
			Date:       date,
			AvgBpm:     sumBpm / count,
			Steps:      lastSteps,
			SleepHours: lastSleep,
			Calories:   lastCalories,
			AvgSpo2:    sumSpo2 / count,
		})
	}

	sort.Slice(results, func(i, j int) bool {
		return results[i].Date < results[j].Date
	})

	return results, nil
}