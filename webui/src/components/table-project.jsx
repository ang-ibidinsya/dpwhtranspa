import './table-base.css';
import { useEffect, useMemo, useState } from "react";
import { useDispatch } from 'react-redux';
import {
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
  } from "@tanstack/react-table";
import { prepareBody, prepareHeader, preparePagninator} from './table-base';
import { formatMoney, convertStateToTableFilter, getMasterDataValue} from '../util';
import { BarChart} from '../controls/barchart';
import { MultiSelectCheckbox } from '../controls/multiselectCheckbox';
import { EntityTypes, ColumnSizes} from '../enums';
import {getShortCategoryTooltipMessage} from '../controls/controlUtils';
import { CardContainerProject } from './card-project';
import {useWindowWidth} from '../hooks/useWindowWidth';

const BARCHART_ADJUSTER_MIN = 10;
const BARCHART_ADJUSTER_MAX = 10;

const BASE_DATE = new Date('2020-01-01T00:00:00');
function computeDate(days) {
  const result = new Date(BASE_DATE);
  result.setDate(BASE_DATE.getDate() + days);
  return result.toISOString().split('T')[0];
}

// [2025-03-22] Remove react table filters here; use filtered data from reducer instead
const columnDefs = [
    {
        accessorKey: "y",
        header: "Year",
        columnSize: ColumnSizes.ExtraSmall,
        defaultColVisibility: true,
        cell: ({ getValue, row, column, table }) => {
        return <div>{getValue()}</div>
        },
    },
    {
        accessorKey: "fr",
        header: " Contract Effectivity",
        columnSize: ColumnSizes.Small,
        defaultColVisibility: false,
        cell: ({ getValue, row, column, table }) => {                
                let val = getValue();                
                return <div className="divCenter">{val ? computeDate(val): '-'}</div>
            },
    },
    {
        accessorKey: "to",
        header: "Contract Completion",
        columnSize: ColumnSizes.Small,
        defaultColVisibility: false,
        cell: ({ getValue, row, column, table }) => {
                let val = getValue();                
                return <div className="divCenter">{val ? computeDate(val) : '-'}</div>
            },
    },    
    {
        accessorKey: "r",
        header: "Region",
        columnSize: ColumnSizes.Medium,
        //filterFn: 'multiValueFilter',
        defaultColVisibility: true,
        cell: ({ getValue, row, column, table }) => {
                let {masterData} = table.getState();
                return <div>{getMasterDataValue(masterData, EntityTypes.region, getValue())}</div>
            },
    },
    {
        accessorKey: "dt",
        header: "District",
        columnSize: ColumnSizes.Medium,
        //filterFn: 'multiValueFilter',
        defaultColVisibility: true,
        cell: ({ getValue, row, column, table }) => {
                let {masterData} = table.getState();
                return <div>{getMasterDataValue(masterData, EntityTypes.district, getValue())}</div>
            },
    },
    {
        accessorKey: "cg",
        columnSize: ColumnSizes.Medium,
        header: <span style={{whiteSpace: 'nowrap'}}>
            <i className="bx bxs-flask bx-xs bx-fw" color="red"
                data-tooltip-id='generic-tooltip'
                data-tooltip-content={getShortCategoryTooltipMessage()}
            >
            </i>Category</span>,
        //filterFn: 'multiValueFilter',
        defaultColVisibility: true,
        cell: ({ getValue, row, column, table }) => {
                let {masterData} = table.getState();
                return <div className="taggedValueContainer"><div className="taggedValue">{getMasterDataValue(masterData, EntityTypes.category, getValue())}</div></div>
            },
    },
    {
        accessorKey: "ds",
        header: "Project",
        columnSize: ColumnSizes.ExtraLarge,
        enableSorting: false, // disables sorting - from tanstack
        defaultColVisibility: true,
        cell: ({ getValue, row, column, table }) => {
            return <div className="itemDesc">{getValue()}</div>
        },
    },
    {
        accessorKey: "id",
        header: "Contract ID",
        columnSize: ColumnSizes.Title,
        defaultColVisibility: true,
        cell: ({ getValue, row, column, table }) => {
            return <div className="itemDesc">{getValue()}</div>
        },
    },
    {
        accessorKey: "ci",
        header: "Contractor(s)",
        columnSize: ColumnSizes.Large,
        //filterFn: 'multiValueListFilter',
        defaultColVisibility: true,
        cell: ({ getValue, row, column, table }) => {
            let {masterData} = table.getState();
            let contractors = getMasterDataValue(masterData, EntityTypes.contractor, getValue());
            if (contractors.length == 0) {
                return null;
            }
            return <div className="itemDesc">{contractors.map((contractor, i) => <div key={i}>{`• ${contractor}`}</div>)
            }</div>
        },
    },
    {
        accessorKey: "sf",
        header: "Fund Source",
        columnSize: ColumnSizes.Medium,
        //filterFn: 'multiValueFilter',
        defaultColVisibility: false,
        cell: ({ getValue, row, column, table }) => {
            let {masterData} = table.getState();
            return <div className="itemDesc">{getMasterDataValue(masterData, EntityTypes.fundSource, getValue())}</div>
        },
    },
    {
        accessorKey: "s",
        header: "Progress / Status",
        columnSize: ColumnSizes.Small,
        //filterFn: 'multiValueFilter',
        defaultColVisibility: true,        
        // cell: rendered outside because unable to put background color properly here (unable for child to use up parent's entire cell area)
    },
    // Merge Percent with Status to conserve space    
    {
        accessorKey: "pc",
        header: "Progress",
        columnSize: ColumnSizes.Small,
        //filterFn: 'multiValueFilter',
        defaultColVisibility: false,
        permanentlyHide: true,
        cell: ({ getValue, row, column, table }) => {
                return <div className="divCenter">{getValue()}%</div>
            },
    },
    {
        accessorKey: "p",
        header: "Cost",
        columnSize: ColumnSizes.Small,
        sortingFn: 'alphanumeric',
        defaultColVisibility: true,
        cell: ({ getValue, row, column, table }) => {
            // [Transpa] Show the costbar below the cost
            //return <div className="divCost">{formatMoney(getValue())}</div>;
            let {minCost, maxCost} = table.getState();
            let currVal = getValue()
            return <div>
                <div className="divCost">{formatMoney(getValue())}</div>
                <BarChart cost={row.getValue('p')} minCost={minCost} maxCost={maxCost} 
                        adjusterMin={BARCHART_ADJUSTER_MIN}
                        adjusterMax={BARCHART_ADJUSTER_MAX}/>
            </div>
        },
    },
    {
        accessorKey: "CostBar",
        header: "CostBar",
        columnSize: ColumnSizes.Medium,
        defaultColVisibility: false, // [Transpa] Do not show this column as standalone column anymore
        cell: ({ getValue, row, column, table }) => {
            let {minCost, maxCost} = table.getState();
            return <BarChart cost={row.getValue('p')} minCost={minCost} maxCost={maxCost} 
                        adjusterMin={BARCHART_ADJUSTER_MIN}
                        adjusterMax={BARCHART_ADJUSTER_MAX}/>;
        },
    },
];

const getDefaultColVisibility = () => {
    let ret = {};
    columnDefs.forEach(colDef => {
        ret[colDef.accessorKey] = colDef.defaultColVisibility;
    });

    return ret;
}

const showColumnSettings = (columnVisibility, handleColumnVisibilityChange) => {
    let options = columnDefs.map(c => {
        return {
            value: c.accessorKey,
            label: c.header,
            permanentlyHide: c.permanentlyHide
        }
    }).filter(c => c.value !== 'CostBar' && c.permanentlyHide !== true);

    let selectedVals = [];
    for(let key in columnVisibility) {
        if (!columnVisibility.hasOwnProperty(key)) continue;
        if (columnVisibility[key] === true) {
            selectedVals.push(options.find(o => o.value === key));
        }
    }

    return <MultiSelectCheckbox 
        options={options} 
        placeholder={null}
        onChange={(selectedCols) => handleColumnVisibilityChange(selectedCols)}
        value={selectedVals}
    />
}

/* For Project table only */
export const showGrandTotalOrig = (table, costColumn, columnVisibility, handleColumnVisibilityChange) => {
    let rows = table.getFilteredRowModel().rows;
    let sum = 0;
    // Use for instead of foreach, for potential performance improvements
    for (let i = 0; i < rows.length; i++) {
        sum += rows[i].getValue(costColumn)
    }
    
    return <div className="grandTotalSettingsContainer">
        {showColumnSettings(columnVisibility, handleColumnVisibilityChange)}
        <div className="grandTotalSettings-fieldItemContainer">
            <div className="grandTotalLabel">SUBTOTAL:</div>
            <div className="grandTotalValue">{formatMoney(sum)}</div>
        </div>
    </div>;
}

export const showGrandTotal = (grandTotal, columnVisibility, handleColumnVisibilityChange) => {   
    return <div className="grandTotalSettingsContainer">
        {showColumnSettings(columnVisibility, handleColumnVisibilityChange)}
        <div className="grandTotalSettings-fieldItemContainer">
            <div className="grandTotalLabel">SUBTOTAL:</div>
            <div className="grandTotalValue">{formatMoney(grandTotal)}</div>
        </div>
    </div>;
}

const getNumVisibleColumns = (columnVisibility) => {
    let count = 0;
    for(let key in columnVisibility) {
        if (columnVisibility[key]) {
            count++;
        }
    }
    return count;
}

export const TableByProject = (props) => {    
    const [columnFilters, setColumnFilters] = useState([]);
    const {dataState, setLoadingMsg} = props;
    const [columnVisibility, setColumnVisibility] = useState(getDefaultColVisibility());
    

    const table = useReactTable({
        data: dataState.FilteredData.filteredProjects,
        columns: columnDefs,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        initialState: {
            pagination: {
                pageSize: 20,
            },
            sorting: [
            ],
        },
        state: {
            masterData: dataState.MasterData,
            maxCost: dataState.FilteredData.overallProjMaxCost,
            minCost: dataState.FilteredData.overallProjMinCost,
            setLoadingMsg: setLoadingMsg,
            columnVisibility
        },
        onColumnVisibilityChange: setColumnVisibility,
    })

    const handleColumnVisibilityChange = selectedColumns => {
        console.log('[ColumnSettings][handleChange] selectedColumns', selectedColumns);
        let allCols = getDefaultColVisibility();
        for (let key in allCols) {
            if (!allCols.hasOwnProperty(key)) continue;
            allCols[key] = selectedColumns.some(c => c.value === key);
        }
        // [Transpa] Do not show cost bar as standalone column, just put it under the cost value
        //allCols.CostBar = allCols.p; // Costbar always go hand in hand with Cost
      
        setColumnVisibility(allCols);
    };

    console.log('[TableByProject] render grandTotal', formatMoney(dataState.FilteredData.grandTotal), 'columns', );

    useEffect(() => {
        console.log('[Project Table UseEffect]');
        //table.setColumnFilters(convertStateToTableFilter(dataState))
    }, [dataState.Filters.Project, dataState.Filters.Year, dataState.Filters.District, dataState.Filters.Region, 
        dataState.Filters.Status, dataState.Filters.FundSource, dataState.Filters.Contractor, dataState.Filters.Category, dataState.Filters.ContractId,
        dataState.Filters.JointVentures])

    // Determine whether to show card (and how many columns) or table based on the browser width
    const windowWidth = useWindowWidth();
    const numVisibleColums = getNumVisibleColumns(columnVisibility);
    const cardLayoutMaxWidth = numVisibleColums * 105;

    console.log(`[TableByProject] Window Width: ${windowWidth}, visibleCols: ${numVisibleColums}`);
    {/* Show either the table or card, depending on the number of columns */}
    if (windowWidth > cardLayoutMaxWidth) {
        return <>
            {showGrandTotal(dataState.FilteredData.grandTotal, columnVisibility, handleColumnVisibilityChange)}        
            {preparePagninator(table)}

            <table className="tableBase">
                <thead>
                    {prepareHeader(table)}
                </thead>
                <tbody>
                    {prepareBody(table, EntityTypes.project, null, dataState.MasterData)}
                </tbody>
            </table>
            
        </>;    
    }
    else {
        return <CardContainerProject table={table} 
            masterData={dataState.MasterData}
            windowWidth={windowWidth}
        />
    }

    
}