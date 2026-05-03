import './card-base.web.css';
import {
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
  } from "@tanstack/react-table";
import {getMasterDataValue, formatMoney, statusColorMap} from '../util';
import { ColumnSizes, EntityTypes } from "../enums";

const getMappedValue = (cellColId, cellRawValue, masterData, row) => {
    switch(cellColId) {
        case 'r': 
            return getMasterDataValue(masterData, EntityTypes.region, cellRawValue);
        case 'dt':
            return getMasterDataValue(masterData, EntityTypes.district, cellRawValue);
        case 'cg':
            return getMasterDataValue(masterData, EntityTypes.category, cellRawValue);
        case 'p':
            return <div className="divCost" style={{width: '100%'}}>{formatMoney(cellRawValue)}</div>
        case 'ci':
            let contractorArr = getMasterDataValue(masterData, EntityTypes.contractor, cellRawValue);
            return <ul className="cardContractorList">
                {contractorArr.map((contractor) => {return <li key={`key-contractor-${contractor}`}>{contractor}</li>})}
            </ul>
        case 's':
            const status = getMasterDataValue(masterData, EntityTypes.status, cellRawValue);
            const percent = row.getValue('pc');
            const bgColor = statusColorMap[status];
            return <div className="cardStatusField" style={{
                backgroundColor: bgColor
            }}>{percent}% ({status})</div>
        default:
            return cellRawValue;
    }
}

const prepareProjectCard = (row, masterData, cardStyles) => {
    let cells = row.getVisibleCells();
    let retFieldsSmall = [];
    let retFieldsMedium = [];
    let retFieldsBig = [];
    let contractId = row.getValue('id');
    cells.forEach((cell) => {
        let arrToPut = null;
        if (cell.column.columnDef.columnSize >= ColumnSizes.Title) { 
            // Contract Id already processed above 
            return;
        }
        else if (cell.column.columnDef.columnSize >= ColumnSizes.Large) {
            arrToPut = retFieldsBig;
        }
        else if (cell.column.columnDef.columnSize >= ColumnSizes.Medium) {
            //arrToPut = retFieldsMedium;
            arrToPut = retFieldsSmall;
        }
        else if (cell.column.columnDef.columnSize < ColumnSizes.Medium){
            arrToPut = retFieldsSmall;
        }
         
        let mappedValue = getMappedValue(cell.column.id, cell.getValue(), masterData, row);
        arrToPut.push(
        <div className='cardFieldContainer' key={`cardCell=${cell.column.columnDef.header}`}>
            <div className="cardFieldLabel" key={`cardCell=${cell.column.columnDef.header}`}>{cell.column.columnDef.header}</div>
            <div className="cardFieldValue">{mappedValue}</div>
        </div>)
    })
    return <div className='cardProject'>
        <div className="projectCardTitleBar">
            <div className="cardTitle">Contract ID: {contractId}</div>
            <div className="cardRowNum">#{row.index+1}</div>
        </div>
        <div className="projectCardBody">
            <div className='smallFieldsContainer cardFieldAreaContainer' style={{gridTemplateColumns: cardStyles.smallFields.gridTemplateColumns}}>
                {retFieldsSmall}
            </div>
            <div className='mediumFieldsContainer cardFieldAreaContainer' style={{
                gridTemplateColumns: cardStyles.smallFields.gridTemplateColumns,
                marginTop: '0px'
                }}>
                {retFieldsMedium}
            </div>
            <div className='largeFieldsContainer cardFieldAreaContainer' style={{
                gridTemplateColumns: cardStyles.largeFields.gridTemplateColumns,
                marginTop: '0px'
                }}>
                {retFieldsBig}
            </div>       
        </div>     
    </div>;
}

const getCardStyles = (windowWidth) => {
    let cardStyles = {
        smallFields: {},
        largeFields: {}
    }

    if (windowWidth < 600) {
        cardStyles.smallFields.gridTemplateColumns = '1fr';
        cardStyles.largeFields.gridTemplateColumns = '1fr';
    }
    else if (windowWidth < 800) {
        cardStyles.smallFields.gridTemplateColumns = '1fr 1fr';
        cardStyles.largeFields.gridTemplateColumns = '1fr';
    }
    else {
        cardStyles.smallFields.gridTemplateColumns = '1fr 1fr 1fr';
        cardStyles.largeFields.gridTemplateColumns = '1fr';
    }

    return cardStyles;
}

export const CardContainerProject = ({table, masterData, windowWidth}) => {
    let cardStyles = getCardStyles(windowWidth)
    const rows = table.getRowModel().rows;
    const rowElems = rows.map(row => {
        return <div key={row.id}>
            {prepareProjectCard(row, masterData, cardStyles)}
        </div>
    })
    return <div className="cardContainer" style={{
        'gridTemplateColumns': '1fr'
    }}>
        {rowElems}
        </div>
}