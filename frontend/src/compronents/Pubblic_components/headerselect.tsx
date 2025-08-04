import React, { useEffect, useState } from 'react';
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

export default Headers;
