/*import React, { useEffect, useState } from 'react';
import TOP from './header';
import TOP2 from './headerBefore';

import { useAuth } from './AuthContextType';
const Headers: React.FC = () => {
    const { isLoggedIn } = useAuth();


    if (isLoggedIn === null) {
        return null; 
    }

    return (
        <div>
            {isLoggedIn ? <TOP /> : <TOP2 />} 
        </div>
    );
};

export default Headers;*/

import React from 'react';
import TOP from './header';
import { useAuth } from './AuthContextType';

const Headers: React.FC = () => {
    const { isLoggedIn } = useAuth();

    if (isLoggedIn === null) {
        return null; 
    }

    // ตอนนี้เราจะแสดง TOP เสมอถ้า isLoggedIn เป็น true
    return (
        <div>
            {isLoggedIn && <TOP />}
        </div>
    );
};

export default Headers;

