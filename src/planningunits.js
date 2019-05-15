/*global google*/
import React from 'react';
import { Polygon } from 'react-google-maps';
import Dispatcher from "./dispatcher";
import MarkerWithLabel from 'react-google-maps/lib/components/addons/MarkerWithLabel';

const CENTER_X_OFFSET = -0.002;

const center = (coords) => {
    let bounds = new google.maps.LatLngBounds();
    for(let i=0; i<coords.length;i++){
        bounds.extend(new google.maps.LatLng(coords[i].lat, coords[i].lng + CENTER_X_OFFSET));
    }
    return bounds.getCenter();
}

const handleRightClick = (e, pu) => Dispatcher.dispatch({action: 'select_pu', pu: pu, x: e.wa.x, y: e.wa.y});

export default (props) => Object.keys(props.gis).map(pu => {
    return <div key={pu}>
        <Polygon
            path={props.gis[pu]}
            options={{
                fillColor: props.planningUnitsState[pu].color || '#000',
                fillOpacity: 0.3
            }}
            onRightClick={e => handleRightClick(e, pu)}
            onClick={() => Dispatcher.dispatch({action: 'toggle_pu', pu: pu})}
        />
        <MarkerWithLabel
            position={center(props.gis[pu])}
            labelAnchor={new google.maps.Point(0, 0)}
            labelStyle={{backgroundColor: "#ccc", fontSize: 10, padding: 2 }}
            icon='pixel-trans.gif'
            onRightClick={e => handleRightClick(e, pu)}
            onClick={() => Dispatcher.dispatch({action: 'toggle_pu', pu: pu})}
        >
            <div>{pu}</div>
        </MarkerWithLabel>
    </div>;
});