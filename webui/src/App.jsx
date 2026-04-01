import './App.web.css';
import './App.mobile.css';
import {AppHeader} from './components/appHeader';
import { Settings } from './components/settings';
import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector} from 'react-redux';
import { setInitialData } from './state/data/dataSlice';

function App() {
    console.log('[App] Render start...');
    const startTime = performance.now();
    const [finishedLoading, setFinishedLoading] = useState(false);
    const dispatch = useDispatch();

    // Initial loading activities
    useEffect(async () => {
        console.log('[App] useEffect start...');
        const fetchResponseMaster = await fetch('./masterData.gz');
        if (!fetchResponseMaster.ok) {
            console.error('Unable to fetch master data!');
            return;
        }
        const fetchResponseJson = await fetch('./compactJson.json.gz');
        if (!fetchResponseJson.ok) {
            console.error('Unable to fetch contracts data!');
            return;
        }
        const jsonData = await fetchResponseJson.json(); // Already decompressed
        const masterData = await fetchResponseMaster.json(); // Already decompressed
        console.log(`finished fetching data: ${performance.now() - startTime}ms`);
        dispatch(setInitialData({jsonData, masterData}));

    }, []);

    return <div>
        <AppHeader/>
        <Settings/>
    </div>
}

export default App
