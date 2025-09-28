package healthAnalysis // หรือชื่อ package ที่ถูกต้องของคุณ

import (
	"fmt"

    "strconv" 
    "strings" 
	// 💡 ต้องนำเข้า entity และ gorm ด้วย
	"github.com/JanisataMJ/WebApp/entity" 
	"gorm.io/gorm" 
)

func parseHours(sleep string) float64 {
    // 1. ตรวจสอบค่าว่างหรือค่าศูนย์ที่ไม่ชัดเจน
    if sleep == "" || strings.TrimSpace(sleep) == "0 h. 0 m." {
        return 0.0
    }

    // 2. แยกชั่วโมงและนาที
    // เช่น "8 h. 30 m."
    parts := strings.FieldsFunc(sleep, func(r rune) bool {
        return r == 'h' || r == 'm' || r == '.' || r == ' '
    })
    
    // กรองและแปลงส่วนที่เป็นตัวเลข
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
    
    // 3. รวมเป็นชั่วโมงทศนิยม
    return h + (m / 60.0)
}

func AnalyzeHealthData(db *gorm.DB) {
	// 1. ตั้งค่า RiskLevel (ต้องกำหนดค่า lGood, lNormal, lBad ใหม่ในฟังก์ชันนี้)
	var lGood, lNormal, lBad entity.RiskLevel
	
    // ดึง RiskLevels ที่ถูกสร้างไว้ใน SetupDatabase()
    db.First(&lGood, "rlevel = ?", "ดี")
	db.First(&lNormal, "rlevel = ?", "ปกติ")
	db.First(&lBad, "rlevel = ?", "เสี่ยง")

	// 2. ลบ HealthAnalysis เก่าออกก่อนเสมอ (ป้องกันข้อมูลซ้ำ)
	db.Exec("DELETE FROM health_analyses")
	db.Exec("UPDATE SQLITE_SEQUENCE SET seq = 0 WHERE name = 'health_analyses'")

	// 3. ดึง HealthData ทั้งหมด (รวมถึงข้อมูลที่ Import มาจาก Google Sheet)
	var healthDataList []entity.HealthData
	err := db.Find(&healthDataList).Error

	if err != nil {
		fmt.Println("⚠️ WARNING: Error fetching HealthData:", err)
	}

	fmt.Printf("✅ Fetched %d HealthData records for analysis.\n", len(healthDataList))

	if len(healthDataList) == 0 {
		fmt.Println("🛑 No HealthData records found. Skipping HealthAnalysis creation.")
		return
	}

	// 4. ลูปเพื่อวิเคราะห์ข้อมูลแต่ละรายการ
	for _, data := range healthDataList {
		// 🛑 Logic ข้าม: ตรวจสอบค่าที่สำคัญที่สุด
		if data.Bpm == 0 || data.Spo2 == 0.000000 {
			//fmt.Printf("⚠️ Skipping HealthData ID %d due to missing or zero Bpm/Spo2 data.\n", data.ID)
			//continue // ข้ามไปยัง data ถัดไป
		}

		// 🛑 Logic ข้าม: ตรวจสอบ SleepHours ที่เป็น String (ถ้าคุณอยากข้ามข้อมูลที่ไม่มีการนอน)
		if data.SleepHours == "" || data.SleepHours == "0 h. 0 m." {
            // เราอาจเลือกที่จะไม่ข้าม แต่ปล่อยให้ Logic การวิเคราะห์ทำงานต่อไปตามค่าที่ได้รับ
            // ถ้าอยากข้าม:
            // fmt.Printf("⚠️ Skipping HealthData ID %d due to missing SleepHours.\n", data.ID)
            // continue
		}

		healthAnalyses := []entity.HealthAnalysis{}

		// 1. อัตราการเต้นหัวใจ (Bpm)
		var riskBpm entity.RiskLevel
		interpretationBpm := "อัตราการเต้นหัวใจปกติ"
		suggestionBpm := "อัตราการเต้นหัวใจปกติดี"
		riskBpm = lNormal
		if data.Bpm > 100 {
			interpretationBpm = "อัตราการเต้นหัวใจสูง"
			suggestionBpm = "ควรพักผ่อนและปรึกษาแพทย์หากสูงต่อเนื่อง"
			riskBpm = lBad
		} else if data.Bpm < 60 {
			interpretationBpm = "อัตราการเต้นหัวใจต่ำ"
			suggestionBpm = "ควรปรึกษาแพทย์"
			riskBpm = lBad
		}
		healthAnalyses = append(healthAnalyses, entity.HealthAnalysis{
			Category:       "อัตราการเต้นหัวใจ",
			Value:          fmt.Sprintf("%d", data.Bpm),
			Interpretation: interpretationBpm,
			Suggestion:     suggestionBpm,
			HealthDataID:   data.ID,
			RiskLevelID:    riskBpm.ID,
		})

		// 2. จำนวนก้าวเดิน (Steps)
		var riskSteps entity.RiskLevel
		interpretationSteps := "เดินครบ 5,000 ก้าว"
		suggestionSteps := "วันนี้คุณทำได้ดีมาก"
		riskSteps = lGood
		if data.Steps < 5000 {
			interpretationSteps = "ยังเดินไม่ครบ 5,000 ก้าว"
			suggestionSteps = "ควรเดินให้มากขึ้น"
			riskSteps = lBad
		}
		healthAnalyses = append(healthAnalyses, entity.HealthAnalysis{
			Category:       "จำนวนก้าว",
			Value:          fmt.Sprintf("%d ก้าว", data.Steps),
			Interpretation: interpretationSteps,
			Suggestion:     suggestionSteps,
			HealthDataID:   data.ID,
			RiskLevelID:    riskSteps.ID,
		})

		// 3. ออกซิเจนในเลือด (Spo2)
		var riskSpo2 entity.RiskLevel
		interpretationSpo2 := "ปกติ"
		suggestionSpo2 := "อยู่ในเกณฑ์ที่ดี"
		riskSpo2 = lGood
		if data.Spo2 < 95.0 {
			interpretationSpo2 = "ออกซิเจนในเลือดต่ำ"
			suggestionSpo2 = "ควรปรึกษาและพบแพทย์"
			riskSpo2 = lBad
		}
		healthAnalyses = append(healthAnalyses, entity.HealthAnalysis{
			Category:       "ออกซิเจนในเลือด",
			Value:          fmt.Sprintf("%.1f %%", data.Spo2),
			Interpretation: interpretationSpo2,
			Suggestion:     suggestionSpo2,
			HealthDataID:   data.ID,
			RiskLevelID:    riskSpo2.ID,
		})

		// 4. การนอนหลับ (SleepHours) - Logic ที่ถูกแก้ไข
        var riskSleep entity.RiskLevel
        
        // 💡 แปลงชั่วโมงนอนเป็น float เพื่อวิเคราะห์
        sleepHoursFloat := parseHours(data.SleepHours)

        // ตั้งค่าเริ่มต้น
        interpretationSleep := "ไม่มีข้อมูลการนอนหลับ"
        suggestionSleep := "โปรดตรวจสอบการเชื่อมต่อ Smartwatch หรือบันทึกข้อมูล"
        riskSleep = lNormal // เป็น Normal ถ้าไม่มีข้อมูล

        if sleepHoursFloat > 0.0 {
            if sleepHoursFloat < 6.0 {
                // นอนน้อยกว่า 6 ชั่วโมง (เสี่ยง/Bad)
                interpretationSleep = "นอนหลับน้อย"
                suggestionSleep = "ควรเข้านอนให้เร็วขึ้นเพื่อพักผ่อนให้เพียงพอ"
                riskSleep = lBad
            } else if sleepHoursFloat <= 9.0 {
                // นอน 6 ถึง 9 ชั่วโมง (ดี/Good)
                interpretationSleep = "นอนหลับนานปกติ"
                suggestionSleep = "การนอนหลับเหมาะสม รักษาพฤติกรรมนี้ไว้"
                riskSleep = lGood
            } else {
                // นอนมากกว่า 9 ชั่วโมง (เสี่ยง/Bad)
                interpretationSleep = "นอนหลับมากเกินไป"
                suggestionSleep = "คุณอาจนอนหลับมากเกินไป ลองปรับตารางการนอน"
                riskSleep = lBad
            }
        } 
        // ถ้า sleepHoursFloat เป็น 0.0 จะใช้ค่าเริ่มต้น "ไม่มีข้อมูล..." (lNormal)
        
        healthAnalyses = append(healthAnalyses, entity.HealthAnalysis{
            Category:        "การนอนหลับ",
            Value:           data.SleepHours,
            Interpretation:  interpretationSleep,
            Suggestion:      suggestionSleep,
            HealthDataID:    data.ID,
            RiskLevelID:     riskSleep.ID,
        })


		healthAnalyses = append(healthAnalyses, entity.HealthAnalysis{
			Category:       "การนอนหลับ",
			Value:          data.SleepHours,
			Interpretation: interpretationSleep,
			Suggestion:     suggestionSleep,
			HealthDataID:   data.ID,
			RiskLevelID:    riskSleep.ID,
		})

		// 5. แคลอรี่ที่เผาผลาญ (CaloriesBurned)
		var riskCalories entity.RiskLevel
		interpretationCalories := "เผาผลาญพลังงานเพียงพอ"
		suggestionCalories := "คงระดับการทำกิจกรรมไว้"
		riskCalories = lGood

		// เกณฑ์ขั้นต่ำ เช่น ควรเผาผลาญเกิน 500 แคลอรี่
		if data.CaloriesBurned < 500 {
			interpretationCalories = "เผาผลาญพลังงานไม่เพียงพอ"
			suggestionCalories = "ควรทำกิจกรรม หรือเคลื่อนไหวร่างกายให้มากขึ้น"
			riskCalories = lBad
		}

		healthAnalyses = append(healthAnalyses, entity.HealthAnalysis{
			Category:       "พลังงานที่ใช้ไป",
			Value:          fmt.Sprintf("%f", data.CaloriesBurned),
			Interpretation: interpretationCalories,
			Suggestion:     suggestionCalories,
			HealthDataID:   data.ID,
			RiskLevelID:    riskCalories.ID,
		})
        
        // 6. การวิเคราะห์อื่นๆ (เช่น อุณหภูมิร่างกาย) ถ้ามีข้อมูล
        // ...

		// 5. บันทึก HealthAnalysis ทั้งหมดของ HealthData นี้
		for _, analysis := range healthAnalyses {
			db.Create(&analysis)
		}
	}
}