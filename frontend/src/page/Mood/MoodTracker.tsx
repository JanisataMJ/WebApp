import React, { useState } from 'react';
import './MoodTracker.css';

const MoodTracker = () => {
    const [stress, setStress] = useState(2);
    const [waterIntake, setWaterIntake] = useState<number>(0);
    const [todos, setTodos] = useState(['', '', '', '', '']);
    const [note, setNote] = useState('');

    return (
        <div className="tracker-container">
            <header className="header">
                <div className="menu">
                    <span className="logo">HEALTHY</span>
                    <nav>
                        <a href="#">NOW</a>
                        <a href="#">MOOD</a>
                        <a href="#">OVERVIEW</a>
                        <a href="#">HEALTHY TIPS</a>
                    </nav>
                </div>
                <div className="user-info">Jane Doe</div>
            </header>


            <div className="content-box">
                <h2 className="title">Mood Tracker 1 July 2025</h2>

                <div className="grid-wrapper">
                    {/* Left Section */}
                    <div className="grid">
                        <div>
                            <h3 className="section-title">Mood</h3>
                            {/* Mood icons/emojis สามารถเพิ่มตรงนี้ */}
                        </div>

                        <div>
                            <h3 className="section-title2">Stress Level</h3>
                            <div className="stars">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <span
                                        key={s}
                                        className={`star ${s <= stress ? 'filled' : ''}`}
                                        onClick={() => setStress((prev) => (prev === s ? 0 : s))}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="section-title3">Water Intake</h3>
                            <div className="water-buttons">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                                    <button
                                        key={num}
                                        className={`water-btn ${num <= waterIntake ? 'active' : ''}`}
                                        onClick={() =>
                                            setWaterIntake((prev) => (prev === num ? 0 : num)) // คลิกซ้ำ = ล้าง
                                        }
                                    >
                                        💧
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="grid2">
                        <div>
                            <h3 className="section-title4">To do list</h3>
                            {todos.map((item, idx) => (
                                <div key={idx} className="todo-item">
                                    <input type="checkbox" className="checkbox" />
                                    <input
                                        className="todo-input"
                                        value={item}
                                        onChange={(e) => {
                                            const newTodos = [...todos];
                                            newTodos[idx] = e.target.value;
                                            setTodos(newTodos);
                                        }}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="note-section">
                            <h3 className="section-title5">Short note</h3>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                rows={5}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MoodTracker;