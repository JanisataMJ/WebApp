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

	// สร้าง Article
	article := entity.Article{
		Title:       title,
		Information: information,
		Reference:   reference,
		Image:       filePath, // อาจเป็น "" ถ้าไม่มีรูป
		UserID:      userID,
		// PublishDate ปล่อยว่างไว้ จะ set เมื่อ publish
	}

	if err := db.Create(&article).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Article created",
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
        Order("`order` ASC"). // เรียงตาม order
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

    // ตรวจสอบว่ามี Article นี้หรือไม่
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
    if publishDate := c.PostForm("publishDate"); publishDate != "" {
        t, err := time.Parse("2006-01-02", publishDate)
        if err == nil {
            article.PublishDate = t
        }
    }

    // รับไฟล์รูป
    file, err := c.FormFile("image")
    if err == nil {
        uploadDir := "uploads"
        os.MkdirAll(uploadDir, os.ModePerm)
        filePath := filepath.Join(uploadDir, file.Filename)
        c.SaveUploadedFile(file, filePath)
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


type OrderUpdate struct {
    ID    uint `json:"id"`
    Order int  `json:"order"`
}

func UpdateArticleOrder(c *gin.Context) {
    var updates []OrderUpdate
    if err := c.ShouldBindJSON(&updates); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    db := config.DB()
    for _, u := range updates {
        db.Model(&entity.Article{}).Where("id = ?", u.ID).Update("order", u.Order)
    }

    c.JSON(http.StatusOK, gin.H{"message": "Order updated"})
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
