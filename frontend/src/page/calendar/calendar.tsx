import React from "react";
import { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  DateSelectArg,
  EventClickArg,
  EventSourceInput,
} from "@fullcalendar/core";
import {
  getCalendars,
  createCalendar,
  deleteCalendar,
} from '../../services/https/Mood/mood'
import { MoodDataInterface } from "./../../interface/mooddata_interface/mooddata"
import "./calendar.css";
import { Form, Input, Modal, message } from "antd";

const Calendar = () => {
  const [form] = Form.useForm();
  const [currentEvents, setCurrentEvents] = useState<EventSourceInput>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<any | null>(null);
  const calendarRef = useRef<any>(null);
  const [employeeid, setEmployeeid] = useState<number>(
    Number(localStorage.getItem("employeeid")) || 0
  );

  const fetchTasks = async () => {
    try {
      const data = await getCalendars();
      console.log("Fetched data: ", data);

      if (data && Array.isArray(data)) {
        const events: EventSourceInput = data
          .map((task: MoodDataInterface) => {
            if (!task.Title || !task.CalendarDate) {
              console.error("Missing title or startDate:", task);
              return null;
            }

            const parsedDate = new Date(task.CalendarDate);
            if (isNaN(parsedDate.getTime())) {
              console.error("Invalid startDate:", task.CalendarDate);
              return null;
            }

            return {
              id: task.ID ? String(task.ID) : "",
              title: task.Title,
              start: parsedDate,
              allDay: task.AllDay ?? true,
            };
          })
          .filter((event) => event !== null);

        console.log("Processed events: ", events);

        setCurrentEvents(events);
      }
    } catch (error) {
      message.warning("ไม่สามารถโหลดข้อมูลเหตุการณ์ได้");
      console.error("Error fetching calendars:", error);
    }
  };

  useEffect(() => {
    setEmployeeid(Number(localStorage.getItem("employeeid")));
    fetchTasks();
  }, []);

  const handleCreateTask = async (values: { modalTitle: string }) => {
    if (!selectedDate) {
      message.warning("กรุณาเลือกวันที่");
      return;
    }

    if (values.modalTitle.length > 100) {
      message.error("ไม่สามารถสร้างข้อมูลได้ กรุณากรอกข้อมูลให้ถูกต้อง");
      return;
    }

    const startDate = new Date(selectedDate.startStr);
    startDate.setHours(0, 0, 0, 0);

    const isoDate = startDate.toISOString();

    const newCalendar: Omit<MoodDataInterface, "ID"> & { ID: number } = {
      Title: values.modalTitle,
      CalendarDate: isoDate,
      AllDay: true,
      EmployeeID: employeeid,
      ID: 0,
    };

    console.log("Creating Calendar Event with Payload:", newCalendar);

    try {
      await createCalendar(newCalendar);
      setIsModalVisible(false);
      form.resetFields(); 
      message.success("สร้างเหตุการณ์สำเร็จ!");
      fetchTasks();
    } catch (error) {
      message.error("ไม่สามารถสร้างเหตุการณ์ได้");
    }
  };

  const handleEventClick = (selected: EventClickArg) => {
    Modal.confirm({
      title: `คุณแน่ใจหรือไม่ที่จะลบ "${selected.event.title}"?`,
      onOk: async () => {
        try {
          await deleteCalendar(Number(selected.event.id));
          selected.event.remove();
          message.success("ลบเหตุการณ์สำเร็จ");
        } catch {
          message.error("ไม่สามารถลบเหตุการณ์ได้");
        }
      },
    });
  };

  const onFinishFailed = () => {
    message.warning("กรุณากรอกข้อมูลให้ถูกต้อง");
  };

  return (
    <div style={{ margin: 0, padding: "20px", minHeight: "100vh" }}>
      {Array.isArray(currentEvents) && currentEvents.length === 0 ? (
        <div className="no-data-container">
          <p className="text-white text-xl">No events available.</p>
        </div>
      ) : (
        <div className="full-calendar-wrapper">
          <h1 className="header-calendar-box">
            <CalendarIcon size={28} style={{ marginRight: "10px" }} />
            Calendar
          </h1>
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, interactionPlugin, listPlugin]}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,listMonth",
            }}
            initialView="dayGridMonth"
            editable={true}
            selectable={true}
            events={currentEvents}
            select={(e: DateSelectArg) => {
              setSelectedDate(e);
              setIsModalVisible(true);
            }}
            eventClick={handleEventClick}
          />
        </div>
      )}
      <Modal
        title="สร้างเหตุการณ์ใหม่"
        visible={isModalVisible}
        onOk={() => {
          form
            .validateFields()
            .then((values) => {
              handleCreateTask(values);
            })
            .catch((info) => {
              console.error("Validation Failed:", info);
              onFinishFailed();
            });
        }}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinishFailed={onFinishFailed}
          initialValues={{ modalTitle: "" }}
        >
          <Form.Item
            name="modalTitle"
            label="ชื่อเหตุการณ์"
            rules={[
              { required: true, message: "กรุณากรอกชื่อเหตุการณ์" },
              { max: 100, message: "ข้อความต้องไม่เกิน 100 ตัวอักษร" },
            ]}
          >
            <Input placeholder="ชื่อเหตุการณ์" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Calendar;
