import './card-base.web.css';
import {
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
  } from "@tanstack/react-table";
import {getMasterDataValue, formatMoney} from '../util';
import { EntityTypes } from "../enums";

const getMappedValue = (cellColId, cellRawValue, masterData) => {
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
        default:
            return cellRawValue;
    }
}

const prepareProjectCard = (row, masterData) => {
    let cells = row.getVisibleCells();
    let retFields = [];
    cells.forEach((cell) => {        
        let mappedValue = getMappedValue(cell.column.id, cell.getValue(), masterData);
        retFields.push(
        <div className='cardFieldContainer' key={`cardCell=${cell.column.columnDef.header}`}>
            <div className="cardFieldLabel" key={`cardCell=${cell.column.columnDef.header}`}>{cell.column.columnDef.header}</div>
            <div className="cardFieldValue">{mappedValue}</div>
        </div>)
    })
    return <div className='cardProject' style={{
        gridTemplateColumns: '1fr 1fr 1fr'
    }}>{retFields}</div>;
}


export const CardContainerProject = ({table, masterData}) => {
    const rows = table.getRowModel().rows;
    const rowElems = rows.map(row => {
        return <div key={row.id}>
            {prepareProjectCard(row, masterData)}
        </div>
    })
    return <div className="cardContainer" style={{
        'gridTemplateColumns': '1fr'
    }}>
        {rowElems}
        </div>
}