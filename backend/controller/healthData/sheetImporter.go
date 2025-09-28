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
	"time"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"google.golang.org/api/option"
	"google.golang.org/api/sheets/v4"
	
	appConfig "github.com/JanisataMJ/WebApp/config" 
	"github.com/JanisataMJ/WebApp/controller/healthAnalysis"
)

// Constants
const spreadsheetID = "1sX8ZK_x9bYX14IrAUvPjw_tj8ASTbvB0z8BleX9gCuE"

// --- OAuth2 and Google Sheets API Setup ---

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
	fmt.Printf("Go to the following link in your browser then type the " +
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

// --- Config Table and Row Tracking ---

// SetupConfigTable สร้างตาราง config และกำหนดค่าเริ่มต้นแถวแรก
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

	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM config WHERE key = 'last_imported_row'").Scan(&count)
	if err != nil {
		return fmt.Errorf("failed to check config key: %w", err)
	}

	if count == 0 {
		// แถวที่ 2 คือแถวข้อมูลแรก (แถวที่ 1 คือ Header)
		_, err = db.Exec("INSERT INTO config (key, value) VALUES ('last_imported_row', '2')")
		if err != nil {
			return fmt.Errorf("failed to insert initial config value: %w", err)
		}
	}
	return nil
}

func getLastImportedRow(db *sql.DB) int {
	var lastRowStr string
	err := db.QueryRow("SELECT value FROM config WHERE key = 'last_imported_row'").Scan(&lastRowStr)
	if err != nil {
		log.Printf("Could not get last_imported_row, defaulting to 2: %v", err)
		return 2
	}
	lastRow, err := strconv.Atoi(lastRowStr)
	if err != nil {
		log.Printf("Could not parse last_imported_row value '%s', defaulting to 2: %v", lastRowStr, err)
		return 2
	}
	return lastRow
}

func parseTime(timeStr string) (time.Time, error) {
	layouts := []string{
		"2/1/2006, 15:04:05",
		"2/1/2006 15:04:05",
		"1/2/2006, 15:04:05",
		"1/2/2006 15:04:05",
	}

	for _, layout := range layouts {
		t, err := time.Parse(layout, timeStr)
		if err == nil {
			return t, nil
		}
	}
	return time.Time{}, fmt.Errorf("failed to parse time string '%s' with any known layout", timeStr)
}

// --- Main Import Logic ---

// ImportHealthData คือฟังก์ชันหลักในการดึงข้อมูลจาก Google Sheets และบันทึกเข้า DB
func ImportHealthData(db *sql.DB) {
	actualReadStartRow := getLastImportedRow(db)
	readRange := fmt.Sprintf("Data!A%d:G", actualReadStartRow)
	log.Printf("Health data import started. Fetching range: %s", readRange)

	b, err := os.ReadFile("credentials.json")
	if err != nil {
		log.Fatalf("Unable to read client secret file: %v", err)
	}
    // 💡 เปลี่ยนชื่อตัวแปร 'config' เป็น 'oauthConfig'
	oauthConfig, err := google.ConfigFromJSON(b, sheets.SpreadsheetsReadonlyScope) 
	if err != nil {
		log.Fatalf("Unable to parse client secret file to config: %v", err)
	}
    // 💡 ใช้ชื่อใหม่ในการเรียก getClient
	client := getClient(oauthConfig) 
	srv, err := sheets.NewService(context.Background(), option.WithHTTPClient(client))
	if err != nil {
		log.Fatalf("Unable to retrieve Sheets client: %v", err)
	}

	resp, err := srv.Spreadsheets.Values.Get(spreadsheetID, readRange).Do()
	if err != nil || resp.Values == nil || len(resp.Values) == 0 {
		log.Printf("No new data found or error retrieving data: %v", err)
		return
	}
	fmt.Println("New data retrieved. Importing to SQLite...")

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
	stmt, err := tx.Prepare("INSERT OR IGNORE INTO health_data(user_id, timestamp, bpm, steps , spo2, sleep_hours, calories_burned) VALUES(?, ?, ?, ?, ?, ?, ?)")
	if err != nil {
		log.Fatal(err)
	}
	defer stmt.Close()

	dataRows := resp.Values
	rowsProcessed := 0
	
	userIndex, timeIndex, heartRateIndex, stepsIndex, spo2Index, sleepIndex, caloriesIndex := 0, 1, 2, 3, 4, 5, 6

	for _, row := range dataRows {
		if len(row) <= caloriesIndex {
			log.Printf("Skipping row due to insufficient columns: %v", row)
			continue
		}

		userID, err := strconv.Atoi(fmt.Sprintf("%v", row[userIndex]))
		if err != nil {
			log.Printf("Failed to parse user_id '%v': %v", row[userIndex], err)
			continue
		}

		timeStr := fmt.Sprintf("%v", row[timeIndex])
		t, err := parseTime(timeStr)
		if err != nil {
			log.Printf("Failed to parse time string '%s': %v", timeStr, err)
			continue
		}

		formattedTime := t.Format("2006-01-02 15:04:05")

		bpm, _ := strconv.Atoi(fmt.Sprintf("%v", row[heartRateIndex]))
		steps, _ := strconv.Atoi(fmt.Sprintf("%v", row[stepsIndex]))

		var spo2 int
		spo2Str := fmt.Sprintf("%v", row[spo2Index])
		if spo2Str != "" && spo2Str != "<nil>" && spo2Str != "null" {
			spo2, _ = strconv.Atoi(spo2Str)
		}

		sleepHours := fmt.Sprintf("%v", row[sleepIndex])

		var caloriesBurned int
		caloriesStr := fmt.Sprintf("%v", row[caloriesIndex])
		if caloriesStr != "" && caloriesStr != "<nil>" && caloriesStr != "null" {
			caloriesBurned, _ = strconv.Atoi(caloriesStr)
		}

		_, err = stmt.Exec(userID, formattedTime, bpm, steps, spo2, sleepHours, caloriesBurned)
		if err != nil {
			log.Printf("Failed to insert row for user %d at time %s: %v", userID, formattedTime, err)
		}

		rowsProcessed++
	}

	if err := tx.Commit(); err != nil {
		log.Fatalf("Failed to commit transaction: %v", err)
	}

	// 3. อัปเดตแถวล่าสุดที่นำเข้า
	if rowsProcessed > 0 {
		newLastRow := actualReadStartRow + rowsProcessed
		_, err = db.Exec("UPDATE config SET value = ? WHERE key = 'last_imported_row'", strconv.Itoa(newLastRow))
		if err != nil {
			log.Fatalf("Failed to update last_imported_row in config: %v", err)
		}
		fmt.Printf("Data import finished. Successfully processed %d new rows. Next read will start at row %d.\n", rowsProcessed, newLastRow)
		fmt.Println("Starting HealthAnalysis...")
        // 💡 เรียกใช้ฟังก์ชันวิเคราะห์ โดยดึง *gorm.DB จาก config.DB()
        healthAnalysis.AnalyzeHealthData(appConfig.DB()) 
        fmt.Println("HealthAnalysis completed.")
	} else {
		fmt.Println("Data import finished. No new rows were processed.")
	}
}

// StartDataImportJob กำหนดเวลาทำงานของ ImportHealthData ทุก 1 นาที
func StartDataImportJob(sqlDB *sql.DB) {
	ticker := time.NewTicker(1 * time.Minute)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			ImportHealthData(sqlDB)
		}
	}
}