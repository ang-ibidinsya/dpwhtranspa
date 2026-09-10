import './App.web.css';
import './App.mobile.css';
import {AppHeader} from './components/appHeader';
import { Settings } from './components/settings';
import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector} from 'react-redux';
import { setInitialData } from './state/data/dataSlice';
import { LoadingIndicator } from './controls/loadingIndicator';
import { TableBase } from './components/table-base';
import {createChartToolTip} from './components/table-base';
import {createGenericToolTip} from './controls/controlUtils';

function App() {
    console.log('[App] Render start...');
    const startTime = performance.now();
    const [finishedLoading, setFinishedLoading] = useState(false);
    const dispatch = useDispatch();
    const dataStateMasterData = useSelector(state => state.dataReducer?.MasterData);

    // Initial loading activities
    useEffect(() => {
        const fetchGzippedJson = async(url) => {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch ${url}`);

            const decompressedStream = response.body.pipeThrough(new DecompressionStream('gzip'));
            return await new Response(decompressedStream).json();
        };

        const fetchData = async() => {
            console.log('[App] useEffect start...');
            try {
                const contractsJson = await fetchGzippedJson('./categorizedContractsgz');
                const masterDataJson = await fetchGzippedJson('./categorizedMasterDatagz');
                console.log(`finished fetching data: ${performance.now() - startTime}ms`);
                dispatch(setInitialData({contractsJson, masterDataJson}));
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
        {createChartToolTip('chart-tooltip', dataStateMasterData)}
        {createGenericToolTip('generic-tooltip')}        
        <AppHeader/>
        <Settings/>
        <TableBase/>
    </div>
}

export default App
