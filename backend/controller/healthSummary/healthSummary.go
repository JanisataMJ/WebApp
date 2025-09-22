package healthSummary

import (
	"fmt"
	"net/http"
	"strconv"
	"time"
	"log"

	"github.com/JanisataMJ/WebApp/config"
	"github.com/JanisataMJ/WebApp/entity"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type HealthSummaryResponse struct {
	PeriodStart string  `json:"period_start"`
	PeriodEnd   string  `json:"period_end"`
	AvgBpm      float64 `json:"avg_bpm"`
	MinBpm      uint    `json:"min_bpm"`
	MaxBpm      uint    `json:"max_bpm"`
	AvgSteps    float64 `json:"avg_steps"`
	TotalSteps  int     `json:"total_steps"`
	AvgSleep    float64 `json:"avg_sleep"`
	AvgCalories float64 `json:"avg_calories"`
	AvgSpo2     float64 `json:"avg_spo2"`
	WeekNumber  uint    `json:"week_number"`
}

// แปลง "7 h. 30 m." เป็น 7.5
func ParseSleepHours(s string) float64 {
	var hours, minutes float64
	_, err := fmt.Sscanf(s, "%f h. %f m.", &hours, &minutes)
	if err != nil {
		return 0
	}
	return hours + minutes/60
}

// GET /health-summary
func ListHealthSummary(c *gin.Context) {
	var summary []entity.HealthSummary

	// โหลดพร้อม Preload User
	if err := config.DB().
		Preload("User").
		Find(&summary).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, summary)
}

// GET /health-summary/:id
func GetHealthSummary(c *gin.Context) {
	id := c.Param("id")

	// แปลง id เป็น uint
	summaryID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid ID"})
		return
	}

	var summary entity.HealthSummary

	// preload user + notification (ถ้าต้องการให้แสดงการแจ้งเตือนที่เกี่ยวข้อง)
	if err := config.DB().
		Preload("User").
		Preload("Notification").
		First(&summary, summaryID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "HealthSummary not found 1"})
		return
	}

	c.JSON(http.StatusOK, summary)
}

// GET /health/summary/7days/:userID
/* func Get7DaysSummary(c *gin.Context) {
	db := c.MustGet("db").(*gorm.DB)
	userID := c.Param("userID")

	var summary entity.HealthSummary

	// หา Summary ล่าสุด 7 วัน
	err := db.Where("user_id = ?", userID).
		Order("created_at desc").
		First(&summary).Error
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "summary not found"})
		return
	}

	resp := HealthSummaryResponse{
		PeriodStart: summary.PeriodStart.Format("2006-01-02"),
		PeriodEnd:   summary.PeriodEnd.Format("2006-01-02"),
		AvgBpm:      summary.AvgBpm,
		MinBpm:      summary.MinBpm,
		MaxBpm:      summary.MaxBpm,
		AvgSteps:    summary.AvgSteps,
		TotalSteps:  summary.TotalSteps,
		AvgSleep:    summary.AvgSleep,
		AvgCalories: summary.AvgCalories,
		AvgSpo2:     summary.AvgSpo2,
		AvgBodyTemp: summary.AvgBodyTemp,
		MinBodyTemp: summary.MinBodyTemp,
		MaxBodyTemp: summary.MaxBodyTemp,
		WeekNumber:  summary.WeekNumber,
	}

	c.JSON(http.StatusOK, resp)
} */

func GetWeeklySummary(c *gin.Context) {
	db := c.MustGet("db").(*gorm.DB)
	userID := c.Param("id")

	// หาวันจันทร์ล่าสุด
	today := time.Now()
	weekday := int(today.Weekday())
	if weekday == 0 {
		weekday = 7 // Sunday = 7
	}
	startOfWeek := today.AddDate(0, 0, -(weekday - 1)) // จันทร์
	endOfWeek := startOfWeek.AddDate(0, 0, 6)          // อาทิตย์

	// ดึงข้อมูล HealthData ของผู้ใช้ในสัปดาห์
	var healthDatas []entity.HealthData
	if err := db.Where("user_id = ? AND timestamp BETWEEN ? AND ?", userID, startOfWeek, endOfWeek).
		Find(&healthDatas).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch health data"})
		return
	}

	var totalSleep, totalBpm, totalCalories, totalSpo2 float64
	var totalSteps int64
	var minBpm, maxBpm uint

	for i, hd := range healthDatas {
		totalSleep += ParseSleepHours(hd.SleepHours)
		totalBpm += float64(hd.Bpm)
		totalSteps += hd.Steps
		totalCalories += hd.CaloriesBurned
		totalSpo2 += hd.Spo2

		if i == 0 || hd.Bpm < minBpm {
			minBpm = hd.Bpm
		}
		if i == 0 || hd.Bpm > maxBpm {
			maxBpm = hd.Bpm
		}
	}

	count := float64(len(healthDatas))
	avgSleep, avgBpm, avgSteps, avgCalories, avgSpo2 := 0.0, 0.0, 0.0, 0.0, 0.0
	if count > 0 {
		avgSleep = totalSleep / count
		avgBpm = totalBpm / count
		avgSteps = float64(totalSteps) / count
		avgCalories = totalCalories / count
		avgSpo2 = totalSpo2 / count
	}

	var healthSummary entity.HealthSummary

if err := db.Preload("RiskLevel").
    Where("user_id = ?", userID).
    Order("period_start DESC").
    First(&healthSummary).Error; err != nil {
    c.JSON(http.StatusNotFound, gin.H{"error": "HealthSummary not found 2"})
    return
}


result := struct {
    PeriodStart time.Time `json:"period_start"`
    PeriodEnd   time.Time `json:"period_end"`
    AvgBpm      float64   `json:"avg_bpm"`
    MinBpm      uint      `json:"min_bpm"`
    MaxBpm      uint      `json:"max_bpm"`
    TotalSteps  int64     `json:"total_steps"`
    AvgSleep    float64   `json:"avg_sleep"`
    AvgCalories float64   `json:"avg_calories"`
    AvgSpo2     float64   `json:"avg_spo2"`
    AvgSteps    float64   `json:"avg_steps"`
    RiskLevel   string    `json:"risk_level"`
}{
    PeriodStart: startOfWeek,
    PeriodEnd:   endOfWeek,
    AvgBpm:      avgBpm,
    MinBpm:      minBpm,
    MaxBpm:      maxBpm,
    TotalSteps:  totalSteps,
    AvgSleep:    avgSleep,
    AvgCalories: avgCalories,
    AvgSpo2:     avgSpo2,
    AvgSteps:    avgSteps,
    RiskLevel:   healthSummary.RiskLevel.Rlevel, // 👈 ใช้จาก preload
}


	c.JSON(http.StatusOK, result)
	


	log.Println("userID =", userID)
log.Println("startOfWeek =", startOfWeek)
log.Println("endOfWeek =", endOfWeek)


}
