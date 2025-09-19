import React, { useState } from "react";
import { Modal, Button, Form, Input, message, Upload } from "antd";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { createArticle } from "../../../../services/https/Article/article";
import "./createArticle.css";

interface AddArticleModalProps {
  adminID: number;
  onSuccess: () => void;
}

const AddArticle: React.FC<AddArticleModalProps> = ({ adminID, onSuccess }) => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const [form] = Form.useForm();

  const showModal = () => setVisible(true);

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    setPreviewUrl("");
    setVisible(false);
  };

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const formData = new FormData();
      formData.append("title", values.Title);
      formData.append("information", values.Information);
      formData.append("reference", values.Reference || "");
      formData.append("user_id", adminID.toString());

      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append("image", fileList[0].originFileObj);
      }

      await createArticle(adminID, formData);
      message.success("บทความถูกสร้างเรียบร้อยแล้ว!");
      onSuccess();
      handleCancel();
    } catch (error: any) {
      message.error("เกิดข้อผิดพลาดในการสร้างบทความ: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = ({ fileList }: any) => {
    setFileList(fileList);

    if (fileList.length > 0 && fileList[0].originFileObj) {
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target?.result as string);
      reader.readAsDataURL(fileList[0].originFileObj);
    } else {
      setPreviewUrl("");
    }
  };

  return (
    <>
      <Button 
        type="primary" 
        icon={<PlusOutlined />}
        onClick={showModal}
        className="add-article-trigger-btn"
      >
        เพิ่มบทความใหม่
      </Button>

      <Modal
        title={null}
        open={visible}
        onCancel={handleCancel}
        footer={null}
        width={700}
        centered
        className="add-article-modal"
        closeIcon={false}
        maskClosable={false}
      >
        <div className="add-article-modal-content">
          {/* Header */}
          <div className="add-article-modal-header">
            <div className="add-article-header-content">
              <h2 className="add-article-modal-title">สร้างบทความใหม่</h2>
            </div>
          </div>

          {/* Body */}
          <div className="add-article-modal-body">
            <Form 
              form={form} 
              layout="vertical"
              className="add-article-form"
            >
              {/* Image Upload Section */}
              <div className="add-article-upload-section">
                <Form.Item 
                  label="รูปภาพประกอบ" 
                  className="add-article-form-item"
                >
                  <div className="add-article-upload-container">
                    <Upload
                      beforeUpload={() => false}
                      fileList={fileList}
                      onChange={handleFileChange}
                      maxCount={1}
                      listType="picture-card"
                      className="add-article-image-upload"
                      showUploadList={false}
                    >
                      {previewUrl ? (
                        <div className="add-article-preview-container">
                          <img 
                            src={previewUrl} 
                            alt="Preview" 
                            className="add-article-preview-image"
                          />
                          <div className="add-article-preview-overlay">
                            <UploadOutlined className="add-article-preview-icon" />
                          </div>
                        </div>
                      ) : (
                        <div className="add-article-upload-placeholder">
                          <UploadOutlined className="add-article-upload-icon" />
                          <span className="add-article-upload-text">เลือกรูปภาพ</span>
                        </div>
                      )}
                    </Upload>
                  </div>
                </Form.Item>
              </div>

              {/* Form Fields */}
              <div className="add-article-form-fields">
                <Form.Item
                  label="หัวข้อบทความ"
                  name="Title"
                  rules={[{ required: true, message: "กรุณากรอกหัวข้อบทความ!" }]}
                  className="add-article-form-item"
                >
                  <Input 
                    placeholder="ระบุหัวข้อบทความ"
                    className="add-article-form-input"
                  />
                </Form.Item>

                <Form.Item
                  label="เนื้อหา"
                  name="Information"
                  rules={[{ required: true, message: "กรุณากรอกเนื้อหาบทความ!" }]}
                  className="add-article-form-item"
                >
                  <Input.TextArea 
                    rows={6}
                    placeholder="เขียนเนื้อหาบทความที่นี่..."
                    className="add-article-form-textarea"
                  />
                </Form.Item>

                <Form.Item 
                  label="แหล่งอ้างอิง" 
                  name="Reference"
                  rules={[{ required: true, message: "กรุณาเพิ่มแหล่งอ้างอิง!" }]}
                  className="add-article-form-item"
                >
                  <Input 
                    placeholder="ระบุแหล่งอ้างอิง ,URL หรือ ชื่อเขียน"
                    className="add-article-form-input"
                  />
                </Form.Item>
              </div>
            </Form>
          </div>

          {/* Footer */}
          <div className="add-article-modal-footer">
            <div className="add-article-button-group">
              <Button 
                onClick={handleCancel}
                className="add-article-cancel-btn"
              >
                ยกเลิก
              </Button>
              <Button 
                type="primary"
                onClick={handleCreate}
                loading={loading}
                className="add-article-confirm-btn"
              >
                สร้างบทความ
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AddArticle;