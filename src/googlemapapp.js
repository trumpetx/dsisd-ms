import React from 'react';
import {withGoogleMap, GoogleMap} from "react-google-maps";

export default withGoogleMap((props) =>
    <GoogleMap options={{
                    disableDoubleClickZoom: true,
                    scrollwheel: false,
                    draggableCursor: 'crosshair',
                    mapTypeId: 'terrain'
                }}
               defaultZoom={12}
               defaultCenter={{ lat: 30.212793, lng: -98.072734 }}>
        {props.children}
    </GoogleMap>);