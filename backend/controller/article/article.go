package article

import (
	"time"
	"strconv"
	"os"
	"fmt"
	"net/http"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/JanisataMJ/WebApp/config"
	"github.com/JanisataMJ/WebApp/entity"
)

// ✅ Create Article
func CreateArticle(c *gin.Context) {
	db := config.DB()

	// รับค่า text fields
	title := c.PostForm("title")
	information := c.PostForm("information")
	reference := c.PostForm("reference")
	userIDStr := c.PostForm("user_id")
	userID := toUint(userIDStr)

	// ไม่ตั้ง publishDate ตอนสร้างใหม่
	var publishDate *time.Time = nil
	published := false

	// รับไฟล์รูป (ถ้ามี)
	var filePath string
	file, err := c.FormFile("image")
	if err == nil {
		uploadDir := "uploads/articles"
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

	// สร้าง Article (ยังไม่เผยแพร่)
	article := entity.Article{
		Title:       title,
		Information: information,
		Reference:   reference,
		Image:       filePath, // อาจเป็น "" ถ้าไม่มีรูป
		UserID:      userID,
		Published:   published,   // false เสมอ
		PublishDate: publishDate, // null เสมอ
	}

	if err := db.Create(&article).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Article created (draft)",
		"article": article,
	})
}

func toUint(s string) uint {
	i, _ := strconv.Atoi(s)
	return uint(i)
}




// ✅ Get All Articles
func ListArticles(c *gin.Context) { 
	var articles []entity.Article

	if err := config.DB().
		Preload("User").
		Find(&articles).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, articles)
}

// ✅ Get Article by ID
func GetArticleByID(c *gin.Context) {
	id := c.Param("id")
	var article entity.Article

	if err := config.DB().Preload("User").First(&article, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Article not found"})
		return
	}

	c.JSON(http.StatusOK, article)
}

// PUT /articles/:id
func UpdateArticle(c *gin.Context) {
	id := c.Param("id")
	var article entity.Article
	db := config.DB()

	// หา article
	if err := db.First(&article, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Article not found"})
		return
	}

	// รับค่าฟอร์มทั่วไป
	if title := c.PostForm("title"); title != "" {
		article.Title = title
	}
	if information := c.PostForm("information"); information != "" {
		article.Information = information
	}
	if reference := c.PostForm("reference"); reference != "" {
		article.Reference = reference
	}

	// จัดการ PublishDate และ Published
	publishDateStr := c.PostForm("publishDate")
	if publishDateStr != "" {
		// รองรับหลาย format
		layouts := []string{"2006-01-02 15:04:05", "2006-01-02 15:04", "2006-01-02", time.RFC3339}
		var parsedTime time.Time
		var err error

		loc, _ := time.LoadLocation("Local") // ใช้ timezone server/local
		for _, layout := range layouts {
			parsedTime, err = time.ParseInLocation(layout, publishDateStr, loc)
			if err == nil {
				break
			}
		}

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid publishDate format"})
			return
		}

		article.PublishDate = &parsedTime
		// ปรับ Published ตามวัน/เวลา
		if parsedTime.After(time.Now()) {
			article.Published = false
		} else {
			article.Published = true
		}
	} else {
		// ถ้าไม่ได้ส่ง publishDate มา -> ไม่รีเซ็ตค่าเดิม
		if article.PublishDate == nil {
			article.Published = false
		} else {
			if article.PublishDate.After(time.Now()) {
				article.Published = false
			} else {
				article.Published = true
			}
		}
	}

	// รับไฟล์รูป
	file, err := c.FormFile("image")
	if err == nil {
		uploadDir := "uploads/articles"
		os.MkdirAll(uploadDir, os.ModePerm)

		fileName := fmt.Sprintf("%s-%s", uuid.New().String(), filepath.Base(file.Filename))
		filePath := filepath.Join(uploadDir, fileName)

		if err := c.SaveUploadedFile(file, filePath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save image"})
			return
		}
		article.Image = filePath
	}

	// บันทึก
	if err := db.Save(&article).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Article updated successfully",
		"article": article,
	})
}




// PUT /articles/:id/publishArticle
func PublishArticleNow(c *gin.Context) {
    id := c.Param("id")
    var article entity.Article
    db := config.DB()

    if err := db.First(&article, id).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Article not found"})
        return
    }

    now := time.Now()
    article.Published = true
    article.PublishDate = &now

    if err := db.Save(&article).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "message": "Article published immediately",
        "article": article,
    })
}

// PUT /articles/:id/unpublishArticle
func UnpublishArticle(c *gin.Context) {
    id := c.Param("id")
    var article entity.Article
    db := config.DB()

    if err := db.First(&article, id).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Article not found"})
        return
    }

    article.Published = false

    if err := db.Save(&article).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "message": "Article unpublished",
        "article": article,
    })
}




type OrderUpdate struct {
	ID    uint `json:"id"`
	Order int  `json:"order"`
}


// DELETE /articles/:id
func DeleteArticle(c *gin.Context) {
	id := c.Param("id")

	if err := config.DB().Delete(&entity.Article{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}
