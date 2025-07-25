import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import {
  FaBold,
  FaHeading,
  FaItalic,
  FaListOl,
  FaListUl,
  FaStrikethrough,
  FaUnderline,
  FaUndo,
  FaRedo,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
} from 'react-icons/fa';
import './NovelEditor.css';

interface NovelEditorProps {
  setNovelContent: (content: string) => void;
  initialContent: string;
}

const MenuBar = ({ editor }: any) => {
  if (!editor) return null;

  return (
    <div className="menuBar">
      <div>
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'is-active' : ''}
        >
          <FaBold />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'is-active' : ''}
        >
          <FaItalic />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive('underline') ? 'is-active' : ''}
        >
          <FaUnderline />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive('strike') ? 'is-active' : ''}
        >
          <FaStrikethrough />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
        >
          <FaHeading />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
        >
          <FaHeading className="heading3" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'is-active' : ''}
        >
          <FaListUl />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'is-active' : ''}
        >
          <FaListOl />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}
        >
          <FaAlignLeft />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}
        >
          <FaAlignCenter />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}
        >
          <FaAlignRight />
        </button>
      </div>
      <div>
        <button onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
          <FaUndo />
        </button>
        <button onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
          <FaRedo />
        </button>
      </div>
    </div>
  );
};

const NovelEditor: React.FC<NovelEditorProps> = ({ setNovelContent, initialContent }) => {
  const [localContent, setLocalContent] = useState(initialContent || '');

  // สร้างคีย์เฉพาะสำหรับแต่ละนิยาย (เช่น novelId)
  const novelId = 'uniqueNovelId'; // แทนที่ด้วย ID หรือข้อมูลเฉพาะของนิยาย
  const storageKey = `novelContent_${novelId}`;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3], // รองรับ heading ระดับ 1-3
        },
      }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph', 'listItem'] }), // ตั้งค่าประเภทที่ใช้ TextAlign ได้
    ],
    content: localContent,
    onUpdate: ({ editor }) => {
      const updatedContent = editor.getHTML();
      setLocalContent(updatedContent);
      setNovelContent(updatedContent);
      localStorage.setItem(storageKey, updatedContent); // บันทึกเนื้อหาลง localStorage
    },
    autofocus: false,
  });

  // ดึงข้อมูลจาก localStorage เมื่อ editor ถูกสร้าง
  useEffect(() => {
    if (editor) {
      const savedContent = localStorage.getItem(storageKey);
      if (savedContent) {
        editor.commands.setContent(savedContent);
      }
    }
  }, [editor, storageKey]);

  // ตั้งค่า content ใหม่ใน editor ทันทีที่ initialContent เปลี่ยน
  useEffect(() => {
    if (editor && initialContent && localContent !== initialContent) {
      editor.commands.setContent(initialContent);
    }
  }, [editor, initialContent, localContent]);

  return (
    <div className="textEditor">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default NovelEditor;
