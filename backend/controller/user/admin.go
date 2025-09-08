package users

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/JanisataMJ/WebApp/config"
	"github.com/JanisataMJ/WebApp/entity"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type (
	createAdmin struct {
		Username    string    `json:"username" binding:"required"`
		Password    string    `json:"password" binding:"required"`
		Email       string    `json:"email" binding:"required,email"`
		FirstName   string    `json:"firstName" binding:"required"`
		LastName    string    `json:"lastName" binding:"required"`
		Birthdate   time.Time `json:"birthdate"`
		Phonenumber string    `json:"phonenumber"`
		Profile     string    `json:"profile"`
		GenderID    uint      `json:"genderID"`
	}
)

// create admin
func CreateAdmin(c *gin.Context) {
	db := config.DB()

	username := c.PostForm("username")
	firstName := c.PostForm("firstName")
	lastName := c.PostForm("lastName")
	email := c.PostForm("email")
	password := c.PostForm("password")
	genderID := c.PostForm("genderID")
	phonenumber := c.PostForm("phonenumber")

	birthdateStr := c.PostForm("birthdate")
	var birthdate time.Time
	if birthdateStr != "" {
		parsed, err := time.Parse("2006-01-02", birthdateStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid birthdate format"})
			return
		}
		loc, _ := time.LoadLocation("Asia/Bangkok")
		birthdate = time.Date(parsed.Year(), parsed.Month(), parsed.Day(), 0, 0, 0, 0, loc)
	}

	// รับไฟล์รูป
	file, err := c.FormFile("profile")
	var filePath string
	if err == nil {
		uploadDir := "uploads"
		if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create upload directory"})
			return
		}
		fileName := fmt.Sprintf("%s-%s", uuid.New().String(), file.Filename)
		filePath = filepath.Join(uploadDir, fileName)
		if err := c.SaveUploadedFile(file, filePath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
			return
		}
	}

	// เช็ค email ซ้ำ
	var adminCheck entity.User
	if err := db.Where("email = ?", email).First(&adminCheck).Error; err == nil && adminCheck.ID != 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "Email is already used"})
		return
	}

	// Hash password
	hashedPassword, err := config.HashPassword(password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// สร้าง Admin
	admin := entity.User{
		Username:    username,
		FirstName:   firstName,
		LastName:    lastName,
		Email:       email,
		Password:    hashedPassword,
		Birthdate:   birthdate,
		Phonenumber: phonenumber,
		Profile:     filePath,
		GenderID:    toUint(genderID),
		RoleID:      1, // fix เป็น Admin
	}

	if err := db.Create(&admin).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Create Admin successful", "data": admin})
}

// helper แปลง string → uint
func toUint(s string) uint {
	i, _ := strconv.Atoi(s)
	return uint(i)
}
