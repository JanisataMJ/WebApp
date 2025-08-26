package utils

import (
    "os"
    "database/sql"
    _ "github.com/mattn/go-sqlite3"
    "gopkg.in/gomail.v2"
)

type User struct {
    Email string
    Alert string
}

/*func SendEmail(to, subject, body string) error {
    emailUser := os.Getenv("EMAIL_USER")
    emailPass := os.Getenv("EMAIL_PASS")
    smtpHost := os.Getenv("SMTP_HOST")
    smtpPort := os.Getenv("SMTP_PORT")

    auth := smtp.PlainAuth("", emailUser, emailPass, smtpHost)
    msg := []byte(fmt.Sprintf("To: %s\r\nSubject: %s\r\n\r\n%s", to, subject, body))

    addr := fmt.Sprintf("%s:%s", smtpHost, smtpPort)
    return smtp.SendMail(addr, auth, emailUser, []string{to}, msg)
}*/

func SendEmail(to, subject, body string) error {
    m := gomail.NewMessage()
    m.SetHeader("From", os.Getenv("EMAIL_USER"))
    m.SetHeader("To", to)
    m.SetHeader("Subject", subject)
    m.SetBody("text/plain", body)

    d := gomail.NewDialer(
        os.Getenv("SMTP_HOST"),
        587,
        os.Getenv("EMAIL_USER"),
        os.Getenv("EMAIL_PASS"),
    )

    return d.DialAndSend(m)
}

func GetPendingAlerts(db *sql.DB) ([]User, error) {
    rows, err := db.Query("SELECT email, alert FROM user_alerts WHERE sent=0")
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var users []User
    for rows.Next() {
        var u User
        rows.Scan(&u.Email, &u.Alert)
        users = append(users, u)
    }
    return users, nil
}

func MarkAsSent(db *sql.DB, email string) {
    db.Exec("UPDATE user_alerts SET sent=1 WHERE email=?", email)
}
