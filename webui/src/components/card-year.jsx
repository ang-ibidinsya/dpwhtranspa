import './card-base.web.css';
import { useRef } from 'react';
import {showGrandTotalDirectly, showStatusLegends, preparePagninator} from './table-base';
import {getMasterDataValue, formatMoney, statusColorMap} from '../util';
import { mapYearColors, mapStatusColors, StackedBarChart, getCategoryColor, getStatusColor } from '../controls/stackedbarchart';

const prepareYearCard = (row, masterData, table) => {
    let year = row.getValue('year');
    let subtotal = row.getValue('subtotal');
    let {entityGroups, minCost, maxCost, checkedStretch, pagination} = table.getState();
    const findEntity = entityGroups.find(grp => grp.year === year);

    let cells = row.getVisibleCells();
    let retFields = [];
    cells.forEach((cell) => {
        retFields.push(<div className='cardFieldContainer' key={`cardCell-${cell.column.columnDef.header}`}>
            <div>{cell.column.columnDef.header}</div>
            <div>{cell.getValue()}</div>
        </div>);
    });

    const subtotalsTooltip = {
        dataType: 'status', 
        items: findEntity.statusSubTotals,
        categoryMaster: mapStatusColors
    };

    let pageIndex = row.index + pagination.pageIndex * pagination.pageSize;

    return <div className='cardItem'>
        <div className="projectCardTitleBar">
            <div className="cardTitle">Year: {year}</div>
            <div className="cardRowNum">#{pageIndex+1}</div>
        </div>
        <div className="projectCardBody">
            <div className=''>
                <div className='cardFieldContainer cardCostField'>
                    <div className="">Cost:</div>
                    <div className="divCost">{formatMoney(subtotal)}</div>
                </div>
            </div>

            <div className='cardCostbarContainer'>
                <div
                data-tooltip-id="chart-tooltip"
                data-tooltip-content={JSON.stringify(subtotalsTooltip)}
                >                        
                <StackedBarChart name={`card-year=${year}`} 
                                subtotalsMap={findEntity.statusSubTotals} 
                                minCost={minCost} 
                                maxCost={maxCost} 
                                stretchToFullWidth={false} 
                                dataType='status'
                                masterData={masterData}/>
                </div>                
            </div>
        </div>        
    </div>;
}

export const CardContainerYear = ({table, masterData, windowWidth, grandTotal}) => {
    const rows = table.getRowModel().rows;
    let cardContainerTopRef = useRef(null)
    const rowElems = rows.map(row => {
        return <div key={row.id}>
            {prepareYearCard(row, masterData, table)}
        </div>
    })
    return <div ref={cardContainerTopRef}>
            {showGrandTotalDirectly(grandTotal)}
            {showStatusLegends()}
            {preparePagninator(table)}
            <div className="cardContainer" style={{
                'gridTemplateColumns': '1fr'
            }}>
                {rowElems}
            </div>
            {preparePagninator(table, cardContainerTopRef)}
        </div>
}