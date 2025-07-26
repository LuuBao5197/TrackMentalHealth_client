import React from 'react';
import HeroPage from './HeroPage';
import AllForm from '../LessonPage/AllForm';

function HomePage(props) {
    return (
        <div>
            <HeroPage/>
            <AllForm/>
        </div>
    );
}

export default HomePage;