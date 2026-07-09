import './card-base.web.css';
import { useRef } from 'react';
import {showGrandTotalDirectly, showStatusLegends, preparePagninator} from './table-base';
import {getMasterDataValue, formatMoney, statusColorMap} from '../util';
import { mapYearColors, mapStatusColors, StackedBarChart, getCategoryColor, getStatusColor } from '../controls/stackedbarchart';
import { EntityTypes } from '../enums';

const prepareFundSourceCard = (row, masterData, table, sortedIndex) => {
    let fundSource = row.getValue('fundSource');
    let fundSourceName = getMasterDataValue(masterData, EntityTypes.fundSource, fundSource);
    let subtotal = row.getValue('subtotal');
    let {entityGroups, minCost, maxCost, checkedStretch, pagination} = table.getState();
    const findEntity = entityGroups.find(grp => grp.fundSource === fundSource);

    let cells = row.getVisibleCells();
    let retFields = [];
    cells.forEach((cell) => {
        retFields.push(<div className='cardFieldContainer' key={`cardCell-${cell.column.columnDef.header}`}>
            <div>{cell.column.columnDef.header}</div>
            <div>{cell.getValue()}</div>
        </div>);

    });

    const subtotalsByStatusTooltip = {
        dataType: 'status', 
        items: findEntity.statusSubTotals,
        categoryMaster: mapStatusColors
    };

    const subtotalsByYearTooltip = {
        dataType: 'year', 
        items: findEntity.yearSubTotals,
        categoryMaster: mapYearColors
    };

    let pageIndex = sortedIndex + pagination.pageIndex * pagination.pageSize;

    return <div className='cardItem'>
        <div className="projectCardTitleBar">
            <div className="cardTitle">{fundSourceName}</div>
            <div className="cardRowNum">#{pageIndex+1}</div>
        </div>
        <div className="projectCardBody">
            <table className="tableInsideCard">
                <tbody>
                <tr className="tableInsideCard-row">
                    <td className="tableInsideCard-firstCol">Cost:</td>
                    <td className="divCost tableInsideCard-Cost">{formatMoney(subtotal)}</td>
                </tr>

                <tr className="tableInsideCard-row">
                    <td className="tableInsideCard-firstCol">Cost By Status:</td>
                    <td className="tableInsideCard-secondCol"><div className=''>
                            <div
                            data-tooltip-id="chart-tooltip"
                            data-tooltip-content={JSON.stringify(subtotalsByStatusTooltip)}
                            >                        
                            <StackedBarChart name={`card-fundSource-${fundSource}`} 
                                            subtotalsMap={findEntity.statusSubTotals} 
                                            minCost={minCost} 
                                            maxCost={maxCost} 
                                            stretchToFullWidth={false} 
                                            dataType='status'
                                            masterData={masterData}/>
                            </div>                
                        </div>
                    </td>
                </tr>

                <tr className="tableInsideCard-row">
                    <td className="tableInsideCard-firstCol">Cost By Year:</td>
                    <td className="tableInsideCard-secondCol"><div className=''>
                            <div
                            data-tooltip-id="chart-tooltip"
                            data-tooltip-content={JSON.stringify(subtotalsByYearTooltip)}
                            >                        
                            <StackedBarChart name={`card-fundSource=${fundSource}`} 
                                            subtotalsMap={findEntity.yearSubTotals} 
                                            minCost={minCost} 
                                            maxCost={maxCost} 
                                            stretchToFullWidth={false} 
                                            dataType='year'
                                            masterData={masterData}/>
                            </div>                
                        </div>
                    </td>
                </tr>
                </tbody>
            </table>
            
        </div>        
    </div>;
}

export const CardContainerFundSource = ({table, masterData, windowWidth, grandTotal}) => {
    const rows = table.getRowModel().rows;
    let cardContainerTopRef = useRef(null)
    const rowElems = rows.map( (row, sortedIndex) => {
        return <div key={row.id}>
            {prepareFundSourceCard(row, masterData, table, sortedIndex)}
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