package healthData

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings" 
	"time"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"google.golang.org/api/option"
	"google.golang.org/api/sheets/v4"

	appConfig "github.com/JanisataMJ/WebApp/config"
	"github.com/JanisataMJ/WebApp/controller/healthAnalysis"
)

// Constants
const spreadsheetID = "1FmctyPcIiSVvxx7CwXATXIVE1LKYyciQrqovYinyNn0"

// 💡 ตารางแมปสำหรับกำหนด User ID ตามแหล่งที่มาของข้อมูล (คอลัมน์ H)
var sourceToUserIDMap = map[string]int{
	"Zepp":            2,
	"OHealth":         3,
	"Samsung Health":  4,
	"Mibro Fit":       5,
}

// --- OAuth2 and Google Sheets API Setup (ไม่มีการเปลี่ยนแปลง) ---
func getClient(config *oauth2.Config) *http.Client {
	tokFile := "token.json"
	tok, err := tokenFromFile(tokFile)
	if err != nil {
		tok = getTokenFromWeb(config)
		saveToken(tokFile, tok)
	}
	return config.Client(context.Background(), tok)
}

func getTokenFromWeb(config *oauth2.Config) *oauth2.Token {
	authURL := config.AuthCodeURL("state-token", oauth2.AccessTypeOffline)
	fmt.Printf("Go to the following link in your browser then type the "+
		"authorization code: \n%v\n", authURL)

	var authCode string
	if _, err := fmt.Scan(&authCode); err != nil {
		log.Fatalf("Unable to read authorization code: %v", err)
	}

	tok, err := config.Exchange(context.TODO(), authCode)
	if err != nil {
		log.Fatalf("Unable to retrieve token from web: %v", err)
	}
	return tok
}

func tokenFromFile(file string) (*oauth2.Token, error) {
	f, err := os.Open(file)
	if err != nil {
		return nil, err
	}
	defer f.Close()
	tok := &oauth2.Token{}
	err = json.NewDecoder(f).Decode(tok)
	return tok, err
}

func saveToken(path string, token *oauth2.Token) {
	fmt.Printf("Saving credential file to: %s\n", path)
	f, err := os.OpenFile(path, os.O_RDWR|os.O_CREATE|os.O_TRUNC, 0600)
	if err != nil {
		log.Fatalf("Unable to cache oauth token: %v", err)
	}
	defer f.Close()
	err = json.NewEncoder(f).Encode(token)
	if err != nil {
		log.Fatalf("Unable to save oauth token: %v", err)
	}
}

// --- Config Table and Row Tracking (ไม่มีการเปลี่ยนแปลง) ---

// SetupConfigTable สร้างตาราง config และกำหนดค่าเริ่มต้นแถวแรกสำหรับแต่ละชีท
func SetupConfigTable(db *sql.DB) error {
	sqlStmt := `
	CREATE TABLE IF NOT EXISTS config (
		key TEXT PRIMARY KEY,
		value TEXT
	);
	`
	if _, err := db.Exec(sqlStmt); err != nil {
		return fmt.Errorf("failed to create config table: %w", err)
	}

	// 💡 กำหนดชื่อชีททั้งหมดที่ต้องการติดตามแถวล่าสุด
	sheetsToTrack := []string{"HealthData_Daily", "HealthData_LatestAll"}

	for _, sheetName := range sheetsToTrack {
		key := fmt.Sprintf("last_imported_row_%s", sheetName)
		var count int
		err := db.QueryRow("SELECT COUNT(*) FROM config WHERE key = ?", key).Scan(&count)
		if err != nil {
			return fmt.Errorf("failed to check config key %s: %w", key, err)
		}

		if count == 0 {
			// แถวที่ 2 คือแถวข้อมูลแรก (แถวที่ 1 คือ Header)
			_, err = db.Exec("INSERT INTO config (key, value) VALUES (?, '2')", key)
			if err != nil {
				return fmt.Errorf("failed to insert initial config value for %s: %w", key, err)
			}
		}
	}
	return nil
}

// getLastImportedRow ดึงแถวล่าสุดที่นำเข้าสำหรับชีทที่ระบุ
func getLastImportedRow(db *sql.DB, sheetName string) int {
	key := fmt.Sprintf("last_imported_row_%s", sheetName) // 💡 ใช้ชื่อชีทเป็นส่วนหนึ่งของคีย์
	var lastRowStr string
	err := db.QueryRow("SELECT value FROM config WHERE key = ?", key).Scan(&lastRowStr)
	if err != nil {
		log.Printf("Could not get %s, defaulting to 2: %v", key, err)
		return 2
	}
	lastRow, err := strconv.Atoi(lastRowStr)
	if err != nil {
		log.Printf("Could not parse %s value '%s', defaulting to 2: %v", key, lastRowStr, err)
		return 2
	}
	return lastRow
}

// 📌 ฟังก์ชันที่ถูกแก้ไขเพื่อรองรับรูปแบบ "YYYY-MM-DD HH:MM:SS" และ TrimSpace
func parseTime(timeStr string) (time.Time, error) {
	layouts := []string{
		"2/1/2006, 15:04:05",
		"2/1/2006 15:04:05",
		"1/2/2006, 15:04:05",
		"1/2/2006 15:04:05",
		"2006-01-02 15:04:05", 
	}

	trimmedTimeStr := strings.TrimSpace(timeStr)
	if strings.ToUpper(trimmedTimeStr) == "N/A" || trimmedTimeStr == "" {
		return time.Time{}, fmt.Errorf("time string is empty or N/A")
	}

	for _, layout := range layouts {
		t, err := time.Parse(layout, trimmedTimeStr)
		if err == nil {
			// ✅ การบังคับ Truncate ที่ระดับวินาที (แก้ปัญหาการซ้ำซ้อน)
			t = t.Truncate(time.Second) 
			return t, nil
		}
	}
	return time.Time{}, fmt.Errorf("failed to parse time string '%s' with any known layout", timeStr)
}

// 📌 ฟังก์ชันช่วยจัดการ N/A และรองรับทศนิยม (ParseFloat)
func parseIntOrZero(value interface{}) int {
	s := strings.TrimSpace(fmt.Sprintf("%v", value))
	
	// 💡 ตรวจสอบ N/A (ไม่คำนึงถึงตัวพิมพ์เล็ก/ใหญ่) หรือค่าว่าง
	if strings.ToUpper(s) == "N/A" || s == "" || s == "<nil>" || s == "null" {
		return 0 // คืนค่า 0 หากเป็น N/A หรือว่าง
	}
	
	// ✅ ใช้ ParseFloat เพื่อรองรับค่าทศนิยม
	floatValue, err := strconv.ParseFloat(s, 64)
	if err != nil {
		// ⚠️ แก้ไขข้อความ Log ให้สอดคล้องกับ ParseFloat
		log.Printf("Warning: Failed to parse numeric value '%s' (not a valid number). Returning 0. Error: %v", s, err) 
		return 0 
	}
	
	// ตัดส่วนทศนิยมทิ้งเพื่อแปลงเป็น int
	return int(floatValue)
}

// 📌 ฟังก์ชันช่วยจัดการ N/A สำหรับค่า String (Sleep)
func parseStringOrEmpty(value interface{}) string {
	s := strings.TrimSpace(fmt.Sprintf("%v", value))
	
	// 💡 ตรวจสอบ N/A (ไม่คำนึงถึงตัวพิมพ์เล็ก/ใหญ่) หรือค่าว่าง
	if strings.ToUpper(s) == "N/A" || s == "<nil>" || s == "null" {
		return "" // คืนค่าว่าง (empty string)
	}
	return s
}


// --- Main Import Logic (มีการใช้ฟังก์ชัน parseIntOrZero และ parseStringOrEmpty) ---

// ImportSheetData คือฟังก์ชันหลักในการดึงข้อมูลจาก Google Sheets (ตามชื่อชีท) และบันทึกเข้า DB
func ImportSheetData(db *sql.DB, sheetName string) {
	actualReadStartRow := getLastImportedRow(db, sheetName)
	// อ่านถึงคอลัมน์ H (Index 7) เพื่อให้ครอบคลุมคอลัมน์ source
	readRange := fmt.Sprintf("%s!A%d:H", sheetName, actualReadStartRow)
	log.Printf("Health data import started for sheet: %s. Fetching range: %s", sheetName, readRange)

	b, err := os.ReadFile("credentials.json")
	if err != nil {
		log.Fatalf("Unable to read client secret file: %v", err)
	}
<<<<<<< HEAD
	// 💡 เปลี่ยนชื่อตัวแปร 'config' เป็น 'oauthConfig'
=======
>>>>>>> f729ad321d13e39fac387080b4b03f87a909d160
	oauthConfig, err := google.ConfigFromJSON(b, sheets.SpreadsheetsReadonlyScope)
	if err != nil {
		log.Fatalf("Unable to parse client secret file to config: %v", err)
	}
<<<<<<< HEAD
	// 💡 ใช้ชื่อใหม่ในการเรียก getClient
=======
>>>>>>> f729ad321d13e39fac387080b4b03f87a909d160
	client := getClient(oauthConfig)
	srv, err := sheets.NewService(context.Background(), option.WithHTTPClient(client))
	if err != nil {
		log.Fatalf("Unable to retrieve Sheets client: %v", err)
	}

	resp, err := srv.Spreadsheets.Values.Get(spreadsheetID, readRange).Do()
	if err != nil || resp.Values == nil || len(resp.Values) == 0 {
		log.Printf("No new data found or error retrieving data from %s: %v", sheetName, err)
		return
	}
	fmt.Printf("New data retrieved from %s. Importing to SQLite...\n", sheetName)

	sqlStmt := `
	CREATE TABLE IF NOT EXISTS health_data (
		user_id INTEGER,
		timestamp DATETIME,
		bpm INTEGER,
		steps INTEGER,
		spo2 INTEGER,
		sleep_hours TEXT,
		calories_burned INTEGER,
		UNIQUE(user_id, timestamp)
	);
	`
	if _, err = db.Exec(sqlStmt); err != nil {
		log.Printf("Failed to create table: %v", err)
		return
	}

	tx, err := db.Begin()
	if err != nil {
		log.Fatal(err)
	}
	// 🎯 ใช้ INSERT OR IGNORE เพื่อป้องกันข้อมูลซ้ำตาม UNIQUE(user_id, timestamp)
	stmt, err := tx.Prepare("INSERT OR IGNORE INTO health_data(user_id, timestamp, bpm, steps , spo2, sleep_hours, calories_burned) VALUES(?, ?, ?, ?, ?, ?, ?)")
	if err != nil {
		log.Fatal(err)
	}
	defer stmt.Close()

	dataRows := resp.Values
	rowsProcessed := 0
<<<<<<< HEAD

	userIndex, timeIndex, heartRateIndex, stepsIndex, spo2Index, sleepIndex, caloriesIndex := 0, 1, 2, 3, 4, 5, 6
=======
	
	// B=1: timestamp | C=2: bpm | D=3: steps | E=4: spo2 | F=5: sleep_hours | G=6: calories_burned | H=7: source
	timeIndex, heartRateIndex, stepsIndex, spo2Index, sleepIndex, caloriesIndex, sourceIndex := 1, 2, 3, 4, 5, 6, 7 
>>>>>>> f729ad321d13e39fac387080b4b03f87a909d160

	for _, row := range dataRows {
		// ตรวจสอบว่ามีข้อมูลครบถึงคอลัมน์ H (Index 7)
		if len(row) <= sourceIndex { 
			log.Printf("Skipping row in %s due to insufficient columns (expected H): %v", sheetName, row)
			continue
		}

		// 1. กำหนด user_id จากคอลัมน์ H (sourceIndex)
		sourceStr := strings.TrimSpace(fmt.Sprintf("%v", row[sourceIndex])) 
		
		userID, found := sourceToUserIDMap[sourceStr]
		if !found {
			log.Printf("Skipping row in %s: Unknown device source '%s' in column H. Cannot assign user_id.", sheetName, sourceStr)
			continue
		}

		// 2. การแปลงเวลา (Timestamp) - ใช้ฟังก์ชันที่ถูกแก้ไข
		timeStr := fmt.Sprintf("%v", row[timeIndex])
		t, err := parseTime(timeStr)
		if err != nil {
			log.Printf("Skipping row in %s: Failed to parse timestamp '%s'. Error: %v", sheetName, timeStr, err)
			continue
		}
		// การ Format นี้จะใช้ Timestamp ที่ถูก Truncate แล้ว
		formattedTime := t.Format("2006-01-02 15:04:05")

		// 3. แปลงค่าตัวเลข (ใช้ parseIntOrZero ที่รองรับทศนิยม)
		bpm := parseIntOrZero(row[heartRateIndex])
		steps := parseIntOrZero(row[stepsIndex])
		spo2 := parseIntOrZero(row[spo2Index])
		caloriesBurned := parseIntOrZero(row[caloriesIndex])

		// 4. แปลงค่า String (Sleep) 
		sleepHours := parseStringOrEmpty(row[sleepIndex])

<<<<<<< HEAD
		sleepHours := fmt.Sprintf("%v", row[sleepIndex])

		var caloriesBurned float64
		caloriesStr := fmt.Sprintf("%v", row[caloriesIndex])
		if caloriesStr != "" && caloriesStr != "<nil>" && caloriesStr != "null" {
			// ลองแปลงเป็น float ก่อน
			if val, err := strconv.ParseFloat(caloriesStr, 64); err == nil {
				caloriesBurned = val
			} else {
				log.Printf("Failed to parse calories '%s': %v", caloriesStr, err)
			}
		}

		// จากนั้นเปลี่ยน SQL statement ให้ใช้ float64 แทน int
		stmt, err := tx.Prepare("INSERT OR IGNORE INTO health_data(user_id, timestamp, bpm, steps , spo2, sleep_hours, calories_burned) VALUES(?, ?, ?, ?, ?, ?, ?)")
		if err != nil {
			log.Fatal(err)
		}

		// ใน stmt.Exec ส่ง caloriesBurned เป็น float64
=======

		// 5. บันทึกข้อมูล (INSERT OR IGNORE จะจัดการการซ้ำซ้อน)
>>>>>>> f729ad321d13e39fac387080b4b03f87a909d160
		_, err = stmt.Exec(userID, formattedTime, bpm, steps, spo2, sleepHours, caloriesBurned)
		if err != nil {
			log.Printf("Failed to insert row for user %d (Source: %s) at time %s from %s: %v", userID, sourceStr, formattedTime, sheetName, err)
		}

		rowsProcessed++
	}

	if err := tx.Commit(); err != nil {
		log.Fatalf("Failed to commit transaction for %s: %v", sheetName, err)
	}

	// 6. อัปเดตแถวล่าสุด
	if rowsProcessed > 0 {
		newLastRow := actualReadStartRow + rowsProcessed
		key := fmt.Sprintf("last_imported_row_%s", sheetName)
		// ใช้ INSERT OR REPLACE เพื่อให้มั่นใจว่าค่าจะถูกอัปเดต
		_, err = db.Exec("INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)", key, strconv.Itoa(newLastRow))
		if err != nil {
			log.Fatalf("Failed to update %s in config: %v", key, err)
		}
<<<<<<< HEAD
		fmt.Printf("Data import finished. Successfully processed %d new rows. Next read will start at row %d.\n", rowsProcessed, newLastRow)
		fmt.Println("Starting HealthAnalysis...")
		// 💡 เรียกใช้ฟังก์ชันวิเคราะห์ โดยดึง *gorm.DB จาก config.DB()
		healthAnalysis.AnalyzeHealthData(appConfig.DB())
		fmt.Println("HealthAnalysis completed.")
=======
		fmt.Printf("Data import for %s finished. Successfully processed %d new rows. Next read will start at row %d.\n", sheetName, rowsProcessed, newLastRow)
>>>>>>> f729ad321d13e39fac387080b4b03f87a909d160
	} else {
		fmt.Printf("Data import for %s finished. No new rows were processed.\n", sheetName)
	}
}

// StartDataImportJob กำหนดเวลาทำงานของ ImportSheetData สำหรับทั้งสองชีท (ไม่มีการเปลี่ยนแปลง)
func StartDataImportJob(sqlDB *sql.DB) {
	ticker := time.NewTicker(1 * time.Minute)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			// 1. นำเข้าข้อมูลจาก HealthData_Daily
			ImportSheetData(sqlDB, "HealthData_Daily")

			// 2. นำเข้าข้อมูลจาก HealthData_LatestAll
			ImportSheetData(sqlDB, "HealthData_LatestAll")
			
			// 3. เรียกใช้ HealthAnalysis หลังจากการนำเข้าข้อมูลทั้งหมดเสร็จสิ้น
			fmt.Println("Starting HealthAnalysis...")
			healthAnalysis.AnalyzeHealthData(appConfig.DB())
			fmt.Println("HealthAnalysis completed.")
		}
	}
}
