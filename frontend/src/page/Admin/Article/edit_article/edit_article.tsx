import React, { useState, useEffect } from "react";
import { Modal, Input, Form, message, Upload, Button, Switch } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { updateArticle } from "../../../../services/https/Article/article";
import { ArticleInterface } from "../../../../interface/article_interface/article";
import "./editArticle.css";

interface Props {
  article: ArticleInterface;
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EditArticle: React.FC<Props> = ({ article, visible, onClose, onSuccess }) => {
  const [ImageFile, setImageFile] = useState<File | null>(null);
  const [Published, setPublished] = useState(article.Published || false);

  const [form] = Form.useForm();

  useEffect(() => {
    if (article) {
      form.setFieldsValue({
        title: article.Title,
        information: article.Information,
        reference: article.Reference,
      });
      setImageFile(null);
      setPublished(article.Published || false);
    }
  }, [article, form]);

  const handleOk = async () => {
    try {
      // ✅ validate fields ก่อน
      const values = await form.validateFields();

      const data = new FormData();
      data.append("title", values.title);
      data.append("information", values.information);
      data.append("reference", values.reference);

      if (ImageFile) {
        data.append("image", ImageFile);
      }

      await updateArticle(article.ID, data);
      message.success("อัปเดตบทความสำเร็จ");
      onSuccess();
      onClose();
    } catch (err) {
      message.error("กรุณากรอกข้อมูลให้ครบถ้วน");
    }
  };

  return (
    <Modal
      title={<span className="modal-title-edit-article">แก้ไขบทความ</span>}
      open={visible}
      onCancel={onClose}
      onOk={handleOk}
      okText="บันทึก"
      cancelText="ยกเลิก"
      className="modal-edit-article"
      width={680}
      okButtonProps={{ className: "ok-button-edit-article" }}
      cancelButtonProps={{ className: "cancel-button-edit-article" }}
      maskClosable={false}
    >
      <div className="modal-content-edit-article">
        <Form form={form} layout="vertical" className="form-edit-article">
          {/* Status Section */}
          <div className="status-section-edit-article">
            <div className="status-item-edit-article">
              <span className="status-label-edit-article">สถานะเผยแพร่</span>
              <div className="status-value-edit-article">
                <Switch 
                  checked={Published} 
                  disabled 
                  className="status-switch-edit-article"
                />
                <span className={`status-text-edit-article ${Published ? 'published-edit-article' : 'unpublished-edit-article'}`}>
                  {Published ? "เผยแพร่แล้ว" : "ยังไม่เผยแพร่"}
                </span>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="form-fields-edit-article">
            <Form.Item
              name="title"
              label={<span className="form-label-edit-article">หัวข้อบทความ</span>}
              rules={[{ required: true, message: "กรุณากรอกหัวข้อบทความ" }]}
              className="form-item-edit-article"
            >
              <Input placeholder="กรอกหัวข้อบทความ" className="input-edit-article" />
            </Form.Item>

            <Form.Item
              name="information"
              label={<span className="form-label-edit-article">เนื้อหาบทความ</span>}
              rules={[{ required: true, message: "กรุณากรอกเนื้อหาบทความ" }]}
              className="form-item-edit-article"
            >
              <Input.TextArea placeholder="กรอกเนื้อหาบทความ" className="textarea-edit-article" rows={6} />
            </Form.Item>

            <Form.Item
              name="reference"
              label={<span className="form-label-edit-article">แหล่งอ้างอิง</span>}
              rules={[{ required: true, message: "กรุณากรอกแหล่งอ้างอิง" }]}
              className="form-item-edit-article"
            >
              <Input placeholder="กรอกแหล่งอ้างอิง" className="input-edit-article" />
            </Form.Item>

            <Form.Item
              label={<span className="form-label-edit-article">รูปภาพ</span>}
              required
              className="form-item-edit-article"
            >
              <div className="upload-section-edit-article">
                <Upload
                  beforeUpload={(file) => {
                    setImageFile(file);
                    return false;
                  }}
                  maxCount={1}
                  className="upload-edit-article"
                  showUploadList={false}
                >
                  <Button icon={<UploadOutlined />} className="upload-button-edit-article">
                    เลือกไฟล์รูปภาพ
                  </Button>
                </Upload>

                {ImageFile && (
                  <div className="file-preview-edit-article">
                    <span className="file-name-edit-article">📄 {ImageFile.name}</span>
                  </div>
                )}

                {!ImageFile && article.Image && (
                  <div className="current-image-edit-article">
                    <span className="current-image-label-edit-article">รูปภาพปัจจุบัน:</span>
                    <div className="image-container-edit-article">
                      <img
                        src={`http://localhost:8000/${article.Image}`}
                        alt="current"
                        className="current-image-preview-edit-article"
                      />
                    </div>
                  </div>
                )}

                {!ImageFile && !article.Image && (
                  <span className="image-required-text">กรุณาอัปโหลดรูปภาพ</span>
                )}
              </div>
            </Form.Item>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default EditArticle;
