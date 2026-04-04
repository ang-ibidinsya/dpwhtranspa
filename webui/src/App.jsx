import './App.web.css';
import './App.mobile.css';
import {AppHeader} from './components/appHeader';
import { Settings } from './components/settings';
import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector} from 'react-redux';
import { setInitialData } from './state/data/dataSlice';
import { LoadingIndicator } from './controls/loadingIndicator';
import { TableBase } from './components/table-base';

function App() {
    console.log('[App] Render start...');
    const startTime = performance.now();
    const [finishedLoading, setFinishedLoading] = useState(false);
    const dispatch = useDispatch();

    // Initial loading activities
    useEffect(() => {
        const fetchData = async() => {
            console.log('[App] useEffect start...');
            try {
                const fetchResponseMaster = await fetch('./masterData.gz');
                if (!fetchResponseMaster.ok) {
                    console.error('Unable to fetch master data!');
                    return;
                }
                const fetchResponseJson = await fetch('./compactJson.gz');
                if (!fetchResponseJson.ok) {
                    console.error('Unable to fetch contracts data!');
                    return;
                }
                const constractsJson = await fetchResponseJson.json(); // Already decompressed
                const masterDataJson = await fetchResponseMaster.json(); // Already decompressed
                console.log(`finished fetching data: ${performance.now() - startTime}ms`);
                dispatch(setInitialData({constractsJson, masterDataJson}));
            }
            catch(ex) {
                console.error(`[App] fetchData() error: ${ex}`);
            }

            setFinishedLoading(true);
            console.log('[App] useEffect end...');
        }

        fetchData();
    }, []);

    if (!finishedLoading) {
        return <LoadingIndicator/>;
    }

    return <div>
        <AppHeader/>
        <Settings/>
        <TableBase/>
    </div>
}

export default App
