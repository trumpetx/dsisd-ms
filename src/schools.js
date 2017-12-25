/*global google*/
import React from 'react';
import MarkerWithLabel from 'react-google-maps/lib/components/addons/MarkerWithLabel';

export default (props) => Object.keys(props.schools).map((s) =>
    <MarkerWithLabel
        key={s}
        position={props.schools[s].position}
        labelAnchor={new google.maps.Point(0, 0)}
        labelStyle={{backgroundColor: props.schools[s].color, fontSize: 10, padding: 2, color: props.schools[s].color === '#FFFF00' ? 'black' : 'white' }}
        icon={{
            url: 'http://maps.google.com/mapfiles/kml/shapes/schools.png',
            size: new google.maps.Size(64, 64),
            scaledSize: new google.maps.Size(32, 32),
            anchor: new google.maps.Point(8, 24)
        }}

    >
        <div>{props.schools[s].label}</div>
    </MarkerWithLabel>);