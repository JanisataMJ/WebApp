import React, { useState } from "react";
import { Modal, Button, Form, Input, message, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { createArticle } from "../../../../services/https/Article/article";

interface AddArticleModalProps {
  adminID: number;
  onSuccess: () => void;
}

const AddArticle: React.FC<AddArticleModalProps> = ({ adminID, onSuccess }) => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string>(""); // preview รูปตอนเลือกไฟล์

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
      message.success("Article created successfully!");
      onSuccess();
      handleCancel();
    } catch (error: any) {
      message.error("Failed to create article: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = ({ fileList }: any) => {
    setFileList(fileList);

    // preview รูปจากไฟล์ที่เลือก
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
      <Button type="primary" onClick={showModal}>
        Add Article
      </Button>
      <Modal
        title="Add New Article"
        open={visible}
        onCancel={handleCancel}
        onOk={handleCreate}
        confirmLoading={loading}
        okText="Create"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Title"
            name="Title"
            rules={[{ required: true, message: "Please input article title!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Information"
            name="Information"
            rules={[{ required: true, message: "Please input article information!" }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item label="Reference" name="Reference">
            <Input />
          </Form.Item>

          <Form.Item label="Image">
            <Upload
              beforeUpload={() => false} // ป้องกัน upload อัตโนมัติ
              fileList={fileList}
              onChange={handleFileChange}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Select Image</Button>
            </Upload>
            {previewUrl && (
              <div className="mt-2">
                <img src={previewUrl} alt="Preview" className="h-32 object-cover" />
              </div>
            )}
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AddArticle;
