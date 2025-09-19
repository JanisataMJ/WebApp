// TestSelect.tsx
import React, { useState } from "react";
import { Form, Select } from "antd";
const { Option } = Select;

export default function TestSelect() {
    const [open, setOpen] = useState(false);



    return (
        <div style={{ padding: 40 }}>
            <Form>
                <Form.Item label="เพศ" name="gender">
                    <Select
                        placeholder="Select gender"
                        allowClear
                        getPopupContainer={(trigger) => {
                            console.log("👉 trigger:", trigger);              // element ของ select input
                            console.log("👉 trigger.parentNode:", trigger.parentNode); // parent ของมัน
                            return trigger.parentNode as HTMLElement;        // ลองให้ dropdown เกาะกับ parent
                        }}
                        open={open}
                        onDropdownVisibleChange={(vis) => {
                            console.log("dropdown visible:", vis); // ดูว่ามันถูกสั่งเปิด/ปิดเมื่อไหร่
                            setOpen(vis);
                        }}
                    >
                        <Option value="Male">ผู้ชาย</Option>
                        <Option value="Female">ผู้หญิง</Option>
                    </Select>
                </Form.Item>
            </Form>
        </div>
    );
}
