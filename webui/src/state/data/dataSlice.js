import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Fuse from 'fuse.js';
import {fuseSearch} from './fuseSearch';

const satisfiesFilter = (currData, filters) => {
    if (!filters) {
        return true;
    }

    // [1] year
    if (filters.Year?.length > 0 && !filters.Year.includes(currData.y)) {
        return false;
    }
    // [2] Region
    if (filters.Region?.length > 0 && !filters.Region.includes(currData.r)) {
        return false;
    }
    // [3] District
    if (filters.District?.length > 0 && !filters.District.includes(currData.dt)) {
        return false;
    }
    // [4] Item Name (case insensitive)
    // Orig Simple search
    if (filters.Project && filters.ProjectSearchOption === 'searchExact' 
        && currData.ds.toUpperCase().indexOf(filters.Project.toUpperCase()) < 0) {
        return false;
    }

    // [5] Status
    if (filters.Status?.length > 0 && !filters.Status.includes(currData.s)) {
        return false;
    }

    // [6] Fund Source
    if (filters.FundSource?.length > 0 && !filters.FundSource.includes(currData.sf)) {
        return false;
    }

    // [7] Contractor
    if (filters.Contractor?.length > 0) {
        let currCtorsList = currData.ci;
        let ret = filters.Contractor.some(filter => currCtorsList.includes(filter));
        if (ret === false) {
            return ret;
        }
    }
    
    // [8a] DPWH Category
    if (filters.DpwhCategory?.length > 0 && !filters.DpwhCategory.includes(currData.cg)) {
        return false;
    }

    // [8b] My Category
    if (filters.MyCategory?.length > 0 && !filters.MyCategory.includes(currData.mc)) {
        return false;
    }

    // [9] Contract Id    
    if (filters.ContractId && currData.id.toUpperCase().indexOf(filters.ContractId.toUpperCase()) < 0) {
        return false;
    }

    // [10] Joint Ventures
    if (filters.JointVentures === 'solo' && currData.ci?.length > 1) {        
        return false;
    }
    if (filters.JointVentures === 'jointOnly' && currData.ci?.length < 2) {        
        return false;
    }

    return true;
}

const mapAndFilterData = (data, filters) => {
    let mapYearGroups = {};
    let mapRegionGroups = {};
    let mapDistrictGroups = {};
    let mapFundSourceGroups = {};
    let mapContractorGroups = {};
    let mapCategoryGroups = {};
    let mapMyCategoryGroups = {};
    let filteredProjects = []; // individual projects

    let ret = {
        yearGroups: {},
        regionGroups: {},
        districtGroups: {},
        fundSrcGroups: {},
        contractorGroups: {},
        categoryGroups: {},
        myCategoryGroups: {},
        grandTotal: 0, // filtered Grandtotal
        // not affected by filter
        overallProjMaxCost: 0, 
        overallProjMinCost: Number.MAX_VALUE, 
        overallYearMaxCost: 0,
        overallYearMinCost: Number.MAX_VALUE,
        overallRegionMaxCost: 0,
        overallRegionMinCost: Number.MAX_VALUE,
        overallDistrictMaxCost: 0,
        overallDistrictMinCost: Number.MAX_VALUE,
        overallFundSourceMaxCost: 0,
        overallFundSourceMinCost: Number.MAX_VALUE,
        overallContractorMaxCost: 0,
        overallContractorMinCost: Number.MAX_VALUE,
        overallCategoryMaxCost: 0,
        overallCategoryMinCost: Number.MAX_VALUE,
        overallMyCategoryMaxCost: 0,
        overallMyCategoryMinCost: Number.MAX_VALUE,
        filteredProjects: []
    }
    if (!data) {
        return ret;
    }

    let anyFilter = hasFilter(filters);
    
    // Optimization TODO: Do not re-compute unfiltered items each time
    let unFilteredYearMap = {};
    let unFilteredRegionMap = {};
    let unFilteredDistrictMap = {};
    let unFilteredFundSrcMap = {};
    let unFilteredContractorMap = {};
    let unFilteredCategoryMap = {};
    let unFilteredMyCategoryMap = {};
    if (!anyFilter) {
        filteredProjects = data;
    }
    let preFilteredData = data;
    if (filters?.Project?.length > 0 && filters.ProjectSearchOption === 'searchFuzzy') {
        console.log('[FuzzySearch start]', filters.Project);        
        const searchVals = fuseSearch.search(filters.Project, data);
        console.log('[FUSE] searchVals Result for', filters.Project, ':', searchVals);
        preFilteredData = searchVals.map(result => result.item);
    }   

    // use for instead of forEach
    for (let i = 0; i < preFilteredData.length; i++) {        
        let currData = preFilteredData[i];
        let currYear = currData.y;
        let currRegion = currData.r;
        let currDistrict = currData.dt;
        let currFundSource = currData.sf;
        let currContractorList = currData.ci;
        let currCategory = currData.cg;
        let currMyCategory = currData.mc;

        let bSatisfiesFilter = satisfiesFilter(currData, filters);

        if (bSatisfiesFilter) { // temprarily filter it
            ret.overallProjMaxCost = Math.max(ret.overallProjMaxCost, currData.p);
            ret.overallProjMinCost = Math.min(ret.overallProjMinCost, currData.p);    

            if (anyFilter) {
                filteredProjects.push(currData);
            }
        
            // [a] year
            if (!mapYearGroups[currYear]) {
                mapYearGroups[currYear] = {    
                    items:[], 
                    subtotal: 0,
                    year: currYear,
                    statusSubTotals: {}
                };
            }
            if (!unFilteredYearMap[currYear]) {
                unFilteredYearMap[currYear] = {
                    subtotal: 0
                }
            }
            unFilteredYearMap[currYear].subtotal += currData.p;

            // [b] region
            if (!mapRegionGroups[currRegion]) {
                mapRegionGroups[currRegion] = {
                    items:[], 
                    subtotal: 0,
                    region: currRegion,
                    yearSubTotals: {},
                    statusSubTotals: {}
                };
            }
            if (!unFilteredRegionMap[currRegion]) {
                unFilteredRegionMap[currRegion] = {
                    subtotal: 0
                }
            }
            unFilteredRegionMap[currRegion].subtotal += currData.p;

            // [c] district
            if (!mapDistrictGroups[currDistrict]) {
                mapDistrictGroups[currDistrict] = {
                    items:[], 
                    subtotal: 0,
                    district: currDistrict,
                    yearSubTotals: {},
                    statusSubTotals: {}
                };
            }
            if (!unFilteredDistrictMap[currDistrict]) {
                unFilteredDistrictMap[currDistrict] = {
                    subtotal: 0
                }
            }
            unFilteredDistrictMap[currDistrict].subtotal += currData.p;

            // [d] Fund Source
            if (!mapFundSourceGroups[currFundSource]) {
                mapFundSourceGroups[currFundSource] = {
                    items:[], 
                    subtotal: 0,
                    fundSource: currFundSource,
                    yearSubTotals: {},
                    statusSubTotals: {}
                };
            }
            if (!unFilteredFundSrcMap[currFundSource]) {
                unFilteredFundSrcMap[currFundSource] = {
                    subtotal: 0
                }
            }
            unFilteredFundSrcMap[currFundSource].subtotal += currData.p;

            // [e] Contractors             
            for (let iXtor = 0; iXtor < currContractorList.length; iXtor++) {
                let currContractor = currContractorList[iXtor];
                if (!mapContractorGroups[currContractor]) {
                    mapContractorGroups[currContractor] = {
                        items:[], 
                        subtotal: 0,
                        contractor: currContractor,
                        yearSubTotals: {},
                        categorySubTotals: {},
                        myCategorySubTotals: {},
                        statusSubTotals: {}
                    };
                }
                if (!unFilteredContractorMap[currContractor]) {
                    unFilteredContractorMap[currContractor] = {
                        subtotal: 0
                    }
                }
                unFilteredContractorMap[currContractor].subtotal += currData.p;
            }

            // [f] Category
            if (!mapCategoryGroups[currCategory]) {
                mapCategoryGroups[currCategory] = {
                    items:[], 
                    subtotal: 0,
                    category: currCategory,
                    yearSubTotals: {},
                    statusSubTotals: {}
                };
            }
            if (!unFilteredCategoryMap[currCategory]) {
                unFilteredCategoryMap[currCategory] = {
                    subtotal: 0
                }
            }
            unFilteredCategoryMap[currCategory].subtotal += currData.p;

            // [g] My Category
            if (!mapMyCategoryGroups[currMyCategory]) {
                mapMyCategoryGroups[currMyCategory] = {
                    items:[], 
                    subtotal: 0,
                    myCategory: currMyCategory,
                    yearSubTotals: {},
                    statusSubTotals: {}
                };
            }
            if (!unFilteredMyCategoryMap[currMyCategory]) {
                unFilteredMyCategoryMap[currMyCategory] = {
                    subtotal: 0
                }
            }
            unFilteredMyCategoryMap[currMyCategory].subtotal += currData.p;

            mapYearGroups[currYear].subtotal += currData.p;
            mapYearGroups[currYear].statusSubTotals[currData.s] = (mapYearGroups[currYear].statusSubTotals[currData.s] || 0 ) + currData.p;

            mapRegionGroups[currRegion].subtotal += currData.p;
            mapRegionGroups[currRegion].yearSubTotals[currData.y] = (mapRegionGroups[currRegion].yearSubTotals[currData.y] || 0 ) + currData.p;
            mapRegionGroups[currRegion].statusSubTotals[currData.s] = (mapRegionGroups[currRegion].statusSubTotals[currData.s] || 0 ) + currData.p;

            mapDistrictGroups[currDistrict].subtotal += currData.p;
            mapDistrictGroups[currDistrict].yearSubTotals[currData.y] = (mapDistrictGroups[currDistrict].yearSubTotals[currData.y] || 0 ) + currData.p;
            mapDistrictGroups[currDistrict].statusSubTotals[currData.s] = (mapDistrictGroups[currDistrict].statusSubTotals[currData.s] || 0 ) + currData.p;

            mapFundSourceGroups[currFundSource].subtotal += currData.p;
            mapFundSourceGroups[currFundSource].yearSubTotals[currData.y] = (mapFundSourceGroups[currFundSource].yearSubTotals[currData.y] || 0 ) + currData.p;
            mapFundSourceGroups[currFundSource].statusSubTotals[currData.s] = (mapFundSourceGroups[currFundSource].statusSubTotals[currData.s] || 0 ) + currData.p;

            for (let iXtor = 0; iXtor < currContractorList.length; iXtor++) {
                let currContractor = currContractorList[iXtor];
                mapContractorGroups[currContractor].subtotal += currData.p;
                mapContractorGroups[currContractor].yearSubTotals[currData.y] = (mapContractorGroups[currContractor].yearSubTotals[currData.y] || 0 ) + currData.p;
                mapContractorGroups[currContractor].categorySubTotals[currData.cg] = (mapContractorGroups[currContractor].categorySubTotals[currData.cg] || 0 ) + currData.p;
                mapContractorGroups[currContractor].myCategorySubTotals[currData.mc] = (mapContractorGroups[currContractor].myCategorySubTotals[currData.mc] || 0 ) + currData.p;
                mapContractorGroups[currContractor].statusSubTotals[currData.s] = (mapContractorGroups[currContractor].statusSubTotals[currData.s] || 0 ) + currData.p;
            }

            mapCategoryGroups[currCategory].subtotal += currData.p;
            mapCategoryGroups[currCategory].yearSubTotals[currData.y] = (mapCategoryGroups[currCategory].yearSubTotals[currData.y] || 0 ) + currData.p;
            mapCategoryGroups[currCategory].statusSubTotals[currData.s] = (mapCategoryGroups[currCategory].statusSubTotals[currData.s] || 0 ) + currData.p;

            mapMyCategoryGroups[currMyCategory].subtotal += currData.p;
            mapMyCategoryGroups[currMyCategory].yearSubTotals[currData.y] = (mapMyCategoryGroups[currMyCategory].yearSubTotals[currData.y] || 0 ) + currData.p;
            mapMyCategoryGroups[currMyCategory].statusSubTotals[currData.s] = (mapMyCategoryGroups[currMyCategory].statusSubTotals[currData.s] || 0 ) + currData.p;

            ret.grandTotal += currData.p;
        }        
    }
    
    ret.filteredProjects = filteredProjects;

    const unfilteredYearData = Object.values(unFilteredYearMap).map (y => y.subtotal);
    const unfilteredRegionData = Object.values(unFilteredRegionMap).map (y => y.subtotal);
    const unfilteredDistrictData = Object.values(unFilteredDistrictMap).map (y => y.subtotal);
    const unfilteredFundSrcData = Object.values(unFilteredFundSrcMap).map (y => y.subtotal);
    const unfilteredContractorData = Object.values(unFilteredContractorMap).map (y => y.subtotal);
    const unfilteredCategoryData = Object.values(unFilteredCategoryMap).map (y => y.subtotal);
    const unfilteredMyCategoryData = Object.values(unFilteredMyCategoryMap).map (y => y.subtotal);
    ret.overallYearMaxCost = Math.max(...unfilteredYearData);
    ret.overallYearMinCost = Math.min(...unfilteredYearData);
    ret.overallRegionMaxCost = Math.max(...unfilteredRegionData);
    ret.overallRegionMinCost = Math.min(...unfilteredRegionData);
    ret.overallDistrictMaxCost = Math.max(...unfilteredDistrictData);
    ret.overallDistrictMinCost = Math.min(...unfilteredDistrictData);
    ret.overallFundSourceMaxCost = Math.max(...unfilteredFundSrcData);
    ret.overallFundSourceMinCost = Math.min(...unfilteredFundSrcData);
    ret.overallContractorMaxCost = Math.max(...unfilteredContractorData);
    ret.overallContractorMinCost = Math.min(...unfilteredContractorData);
    ret.overallCategoryMinCost = Math.min(...unfilteredCategoryData);
    ret.overallCategoryMaxCost = Math.max(...unfilteredCategoryData);
    ret.overallMyCategoryMinCost = Math.min(...unfilteredMyCategoryData);
    ret.overallMyCategoryMaxCost = Math.max(...unfilteredMyCategoryData);

    ret.yearGroups = Object.values(mapYearGroups);
    ret.regionGroups = Object.values(mapRegionGroups);
    ret.districtGroups = Object.values(mapDistrictGroups);
    ret.fundSrcGroups = Object.values(mapFundSourceGroups);
    ret.contractorGroups = Object.values(mapContractorGroups);
    ret.categoryGroups = Object.values(mapCategoryGroups);
    ret.myCategoryGroups = Object.values(mapMyCategoryGroups);

    console.log('[mapAndFilterData] ret', ret);
    return ret;
}

// For both filters and groupings
const initialState = {
    // Main Data and MasterData
    AllData: [],
    MasterData: {},

    // Filters
    Filters: {
        Year: [],
        Region: [],
        District: [],
        Project: '',    
        Contractor: [],        
    },

    // Groupings    
    Grouping: '',
    /*
    FilteredData: {
        GrandTotal: 0,
        YearlyGroups: {},
        RegionGroups: {},
        DistrictGroups: {},
        ContractorGroups: {}
    }
    */
    FilteredData: mapAndFilterData(null, null),
    FilterLoadingMsg: null,
    //FuseData: null, // For fuzzy search
};

const hasFilter = (filters) => {
    return filters?.Year?.length > 0 ||
    filters?.Region?.length > 0 ||
    filters?.District?.length > 0 ||
    filters?.Status?.length > 0 ||
    filters?.FundSource?.length > 0 ||
    filters?.Contractor?.length > 0 ||
    filters?.DpwhCategory?.length > 0 ||
    filters?.MyCategory?.length > 0 ||
    filters?.ContractId?.length > 0 ||
    filters?.Project?.length > 0 ||
    filters?.JointVentures === 'solo' || filters?.JointVentures === 'jointOnly';
}

const dataSlice = createSlice({
    name: 'data',
    initialState,
    reducers: {
        setSettings: (state, action) => { // TODO: rename as setFilters
            console.log('[data reducer][setSettings] Start action:', action);
            Object.assign(state, action.payload);
            Object.assign(state.Filters, action.payload.Filters);
            Object.assign(state.FilteredData, mapAndFilterData(state.AllData, action.payload.Filters))
            console.log('[data reducer][setSettings] Finished action:', action);
        },
        setInitialData: (state, action) => {
            console.log('[settings reducer][setInitialData] action:', action);
            Object.assign(state.AllData, action.payload.constractsJson);
            Object.assign(state.MasterData, action.payload.masterDataJson);
            Object.assign(state.FilteredData, mapAndFilterData(state.AllData, null))
            fuseSearch.setFuse(state.AllData);
        }
    },
    // For handling async actions
    extraReducers: (builder) => {
        builder
        .addCase(setSettingsAsync.pending, (state) => {
            console.log('setSettingsAsync.pending');                        
            state.FilterLoadingMsg = 'Applying Filter...'; // Uncomment to show spinner (we hide it now because filtering seems very fast done asynchronously)
            // TODO: Overall, it becomes slow if there is column sorting applied. This async function finishes fast, so spinner is gone quickly.
            // But the table rendering is slow because it still needs to sort data. Need to move the spinner to somewhere else.
        })
        .addCase(setSettingsAsync.fulfilled, (state, action) => {            
            console.log('setSettingsAsync.fulfilled');
            state.Filters = action.payload.Filters;
            state.FilteredData = action.payload.FilteredData;
            state.Grouping = action.payload.Grouping;
            state.FilterLoadingMsg = null;// Uncomment to show spinner (we hide it now because filtering seems very fast done asynchronously)
        })
    }
});

export const setSettingsAsync = createAsyncThunk(
    'data/setSettingsAsync',
    async(payload, thunkAPI) => {
        console.log('[setSettingsAsync] payload', payload);
        // CRITICAL: Give the browser time to paint the loading state
        // before starting the heavy computation
        await new Promise(resolve => setTimeout(resolve, 50));

        let origState = thunkAPI.getState();
        const updatedState = await new Promise((resolve => {
            const updatedFilteredData = mapAndFilterData(origState.dataReducer.AllData, payload.Filters);
            resolve({
                Filters: payload.Filters,
                FilteredData: updatedFilteredData,
                Grouping: payload.Grouping
            });
        }));
        return updatedState;
    }
);

export const {setSettings, setInitialData} = dataSlice.actions;
export const dataReducer = dataSlice.reducer;