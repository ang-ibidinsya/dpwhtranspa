import "./appHeader.web.css";
import "./appHeader.mobile.css";
import {GlobeIcon} from '../controls/iconManager';

import {getDpwhTooltipMessage} from '../controls/controlUtils';

export const AppHeader = () => {
    return <div className="appHeader">
        <div className="titleLine topLine">
            <img src="./transpa_40.png"  className="appIcon"/>
            <span className="mainTitle">DPWH Transparency Infra Projects</span>
            <div className="subtitle">246,000 Projects&nbsp;&nbsp;|&nbsp;&nbsp;2016 to Nov 30, 2025</div>            
            <div className="subtitle">&nbsp;&nbsp;
                <div data-tooltip-id='generic-tooltip'
                data-tooltip-content={getDpwhTooltipMessage()}
                style={{cursor: 'pointer'}}
                ><GlobeIcon size={22} color="#333" style={{verticalAlign: 'middle'}}/></div> 
                Source: DPWH Transparency Website</div>
        </div>
        <div className="titleLine nextLine">
            
        </div>
    </div>
}