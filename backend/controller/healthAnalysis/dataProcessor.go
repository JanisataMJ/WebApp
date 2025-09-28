package healthAnalysis

import (
	/* "fmt" */
	"log"

	"github.com/JanisataMJ/WebApp/entity"
	"gorm.io/gorm"
)

// ProcessNewHealthData ทำการวิเคราะห์ข้อมูล HealthData ที่เพิ่งบันทึกเข้ามาใหม่
// และบันทึกผลการวิเคราะห์ (HealthAnalysis) ลงในฐานข้อมูล
func ProcessNewHealthData(db *gorm.DB, hd *entity.HealthData) {
	if hd == nil {
		return
	}

	// 1. ดึง RiskLevel entities ที่จำเป็นมาก่อน
	var lGood, lNormal, lBad entity.RiskLevel
	if err := db.Where("r_level = ?", "ดี").First(&lGood).Error; err != nil {
		log.Printf("Error finding RiskLevel 'ดี': %v", err)
		return
	}
	if err := db.Where("r_level = ?", "ปกติ").First(&lNormal).Error; err != nil {
		log.Printf("Error finding RiskLevel 'ปกติ': %v", err)
		return
	}
	if err := db.Where("r_level = ?", "เสี่ยง").First(&lBad).Error; err != nil {
		log.Printf("Error finding RiskLevel 'เสี่ยง': %v", err)
		return
	}

	/* // 2. สร้างรายการ HealthAnalysis
	analyses := []entity.HealthAnalysis{
		{
			Category:       "อัตราการเต้นหัวใจ",
			Value:          fmt.Sprintf("%d bpm", hd.Bpm),
			Interpretation: interpretHeartRate(hd.Bpm),
			Suggestion:     suggestHeartRate(hd.Bpm),
			RiskLevelID:    mapRiskLevelHeartRate(hd.Bpm, lGood, lNormal, lBad),
			HealthDataID:   hd.ID,
		},
		{
			Category:       "จำนวนก้าว",
			Value:          fmt.Sprintf("%d ก้าว", hd.Steps),
			Interpretation: interpretSteps(hd.Steps),
			Suggestion:     suggestSteps(hd.Steps),
			RiskLevelID:    mapRiskLevelSteps(hd.Steps, lGood, lNormal, lBad),
			HealthDataID:   hd.ID,
		},

		{
			Category:       "การนอนหลับ",
			Value:          hd.SleepHours,
			Interpretation: interpretSleep(hd.SleepHours),
			Suggestion:     suggestSleep(hd.SleepHours),
			RiskLevelID:    mapRiskLevelSleep(hd.SleepHours, lGood, lNormal, lBad),
			HealthDataID:   hd.ID,
		},
		{
			Category:       "พลังงานที่ใช้ไป",
			Value:          fmt.Sprintf("%.2f kcal", hd.CaloriesBurned),
			Interpretation: interpretCalories(hd.CaloriesBurned),
			Suggestion:     suggestCalories(hd.CaloriesBurned),
			RiskLevelID:    mapRiskLevelCalories(hd.CaloriesBurned, lGood, lNormal, lBad),
			HealthDataID:   hd.ID,
		},
		{
			Category:       "ออกซิเจนในเลือด",
			Value:          fmt.Sprintf("%.0f %%", hd.Spo2),
			Interpretation: interpretSpo2(hd.Spo2),
			Suggestion:     suggestSpo2(hd.Spo2),
			RiskLevelID:    mapRiskLevelSpo2(hd.Spo2, lGood, lNormal, lBad),
			HealthDataID:   hd.ID,
		},
	}
	// 3. บันทึก HealthAnalysis ทั้งหมดลง DB
	if err := db.Create(&analyses).Error; err != nil {
		log.Printf("Failed to save HealthAnalysis for HealthData ID %d: %v", hd.ID, err)
	} else {
		log.Printf("Successfully created %d HealthAnalysis records for HealthData ID %d", len(analyses), hd.ID)
	}
}

func BackfillHealthAnalysis(db *gorm.DB) {
	log.Println("--- Starting Health Analysis Backfill ---")

	var allHealthData []entity.HealthData
	// ดึง HealthData ทั้งหมดที่ถูกสร้างขึ้น (ไม่ว่าจะมี HealthAnalysis แล้วหรือไม่)
	if err := db.Find(&allHealthData).Error; err != nil {
		log.Printf("Error retrieving all HealthData: %v", err)
		return
	}

	totalProcessed := 0
	for _, hd := range allHealthData {
		// ตรวจสอบว่า HealthAnalysis สำหรับ HealthDataID นี้ถูกสร้างแล้วหรือไม่
		var count int64
		db.Model(&entity.HealthAnalysis{}).Where("health_data_id = ?", hd.ID).Count(&count)

		if count == 0 {
			// ถ้ายังไม่มี HealthAnalysis ให้ดำเนินการวิเคราะห์
			log.Printf("Processing missing analysis for HealthData ID: %d", hd.ID)
			// ส่งข้อมูลไปประมวลผล (ProcessNewHealthData จะจัดการการบันทึก)
			ProcessNewHealthData(db, &hd) 
			totalProcessed++
		}
	}

	log.Printf("--- Health Analysis Backfill Complete. Processed %d missing records. ---", totalProcessed) */
}