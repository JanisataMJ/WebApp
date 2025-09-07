import React, { useState, useEffect } from "react";
import { Modal, Input, Form, message, Upload, Button, Switch } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { updateArticle } from "../../../../services/https/Article/article";
import { ArticleInterface } from "../../../../interface/article_interface/article";

interface Props {
  article: ArticleInterface;
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EditArticle: React.FC<Props> = ({ article, visible, onClose, onSuccess }) => {
  const [Title, setTitle] = useState(article.Title);
  const [Information, setInformation] = useState(article.Information);
  const [Reference, setReference] = useState(article.Reference);
  const [ImageFile, setImageFile] = useState<File | null>(null);
  const [Published, setPublished] = useState(article.Published || false);

  const [form] = Form.useForm();

  useEffect(() => {
    setTitle(article.Title);
    setInformation(article.Information);
    setReference(article.Reference);
    setImageFile(null);
    setPublished(article.Published || false);
    form.setFieldsValue(article);
  }, [article, form]);

  const handleOk = async () => {
    try {
      const data = new FormData();
      data.append("title", Title);
      data.append("information", Information);
      data.append("reference", Reference);
      if (ImageFile) data.append("image", ImageFile);

      await updateArticle(article.ID, data);
      message.success("อัปเดตบทความสำเร็จ");
      onSuccess();
      onClose();
    } catch (err) {
      message.error("อัปเดตไม่สำเร็จ");
    }
  };

  return (
    <Modal
      title="แก้ไขบทความ"
      open={visible}
      onCancel={onClose}
      onOk={handleOk}
      okText="บันทึก"
    >
      <Form form={form} layout="vertical">
        {/* ✅ แสดงสถานะ Published ด้านบนสุด */}
        <Form.Item label="สถานะเผยแพร่">
          <Switch checked={Published} disabled />{" "}
          {Published ? "เผยแพร่แล้ว" : "ยังไม่เผยแพร่"}
        </Form.Item>

        <Form.Item label="หัวข้อบทความ" required>
          <Input value={Title} onChange={(e) => setTitle(e.target.value)} />
        </Form.Item>

        <Form.Item label="เนื้อหาบทความ" required>
          <Input.TextArea
            value={Information}
            onChange={(e) => setInformation(e.target.value)}
          />
        </Form.Item>

        <Form.Item label="อ้างอิง">
          <Input value={Reference} onChange={(e) => setReference(e.target.value)} />
        </Form.Item>

        <Form.Item label="รูปภาพ">
          <Upload
            beforeUpload={(file) => {
              setImageFile(file);
              return false;
            }}
            maxCount={1}
          >
            <Button icon={<UploadOutlined />}>เลือกไฟล์</Button>
          </Upload>
          {article.Image && !ImageFile && (
            <div style={{ marginTop: 8 }}>
              <img
                src={`http://localhost:8000/${article.Image}`}
                alt="current"
                style={{ maxWidth: 200 }}
              />
            </div>
          )}
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditArticle;
