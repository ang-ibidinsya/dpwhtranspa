import './table-base.css';
import { useEffect, useMemo, useState } from "react";
import {
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
  } from "@tanstack/react-table";
import {prepareBody, prepareHeader, preparePagninator, showYearLegends, showGrandTotalDirectlyWithSettings, showStatusLegends} from './table-base';
import {formatMoney, getMasterDataValue} from '../util';
import {EntityTypes} from '../enums';
import {useWindowWidth} from '../hooks/useWindowWidth';
import { CardContainerCategory } from './card-category';

const convertStateToTableFilter = (dataState) => {
    let ret = [{id: 'subtotal', value: null}];// Add a dummy subtotal filter, so that its custom filter can filter out 0 values
    if (dataState.Filters.DpwhCategory?.length > 0) {
        ret.push({id: 'category', value: dataState.Filters.DpwhCategory});
    }
    return ret;
}

export const TableByMyCategory = (props) => {
    
    const [columnFilters, setColumnFilters] = useState([]);
    const [checkedStretch, setCheckedStretch] = useState(false);
    const [sorting, setSorting] = useState([{
        id: 'subtotal',
        desc: true
    }]);
    const {dataState, setLoadingMsg} = props;
    
    console.log('[TableByMyCategory] render, dataState:', dataState);

    const filteredMyCategoryGroups = dataState.FilteredData?.myCategoryGroups;
    console.log('filteredMyCategoryGroups', filteredMyCategoryGroups);

    const columnDefs = [
        {
            accessorKey: "myCategory",
            header: "My Category",
            filterFn: 'multiValueFilter',
        },
        {
            accessorKey: "subtotal",
            header: "Cost",
            filterFn: 'greaterThan0',
            cell: ({ getValue, row, column, table }) => {
                return <div className="divCost">{formatMoney(getValue())}</div>
            },
        },
        {
            accessorKey: "CostBarYear",
            header: "Cost by Year"
        },
        {
            accessorKey: "CostBarStatus",
            header: "Cost by Status",
            enableSorting: false, // disables sorting - from tanstack
        },
    ];

    const table = useReactTable({
        data: filteredMyCategoryGroups,
        columns: columnDefs,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        initialState: {
            pagination: {
                pageSize: 20,
            },
        },
        state: {
            sorting,
            columnFilters: columnFilters,
            entityGroups: dataState.FilteredData.myCategoryGroups,
            maxCost: dataState.FilteredData.overallCategoryMaxCost,
            minCost: dataState.FilteredData.overallCategoryMinCost,
            masterData: dataState.MasterData,
            setLoadingMsg: setLoadingMsg,
            checkedStretch
        },
        onColumnFiltersChange: setColumnFilters,
        filterFns: {
            multiValueFilter: (row, columnId, filterValue) => {                
                let ret = filterValue.includes(row.getValue(columnId));
                return ret;
            },
            greaterThan0:(row, columnId, filterValue) => {
                return row.getValue(columnId) > 0
            }
        }
    })

    useEffect(() => {
        table.setColumnFilters(convertStateToTableFilter(dataState));
    }, [
        dataState.Filters.Project, 
        dataState.Filters.Year, 
        dataState.Filters.District, 
        dataState.Filters.Region,
        dataState.Filters.FundSource,
        dataState.Filters.Contractor,
        dataState.Filters.DpwhCategory, 
        dataState.Filters.MyCategory,
        dataState.Filters.ContractId,
        dataState.Filters.JointVentures
    ])

    const handleCheckboxChange = (arg) => {
        setCheckedStretch(arg.target.checked); // Toggle the checkbox value
      };

    // Determine whether to show card (and how many columns) or table based on the browser width
    const windowWidth = useWindowWidth();
    const cardLayoutMaxWidth = 680;
    console.log(`[TableMyCategory] windowWidth: ${windowWidth}`);
        
    if (windowWidth> cardLayoutMaxWidth) {
        return <div className="tableContainer">
            {showGrandTotalDirectlyWithSettings(dataState.FilteredData.grandTotal, {checkedStretch, handleCheckboxChange})}
            {showYearLegends()}
            {showStatusLegends()}
            {preparePagninator(table)}
            <table className="tableBase">
                <thead>
                    {prepareHeader(table, EntityTypes.myCategory)}
                </thead>
                <tbody>
                    {prepareBody(table, EntityTypes.myCategory, null, dataState.MasterData)}
                </tbody>
            </table>
        </div>;
    }
    else {
        return <CardContainerCategory table={table} 
                            masterData={dataState.MasterData}
                            windowWidth={windowWidth}
                            grandTotal={dataState.FilteredData.grandTotal}
                />
    }
}