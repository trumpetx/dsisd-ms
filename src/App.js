/*global google*/
import React, {Component} from 'react';
import { withGoogleMap, GoogleMap, Polygon } from 'react-google-maps';
import gis from './gis.json';
import MarkerWithLabel from 'react-google-maps/lib/components/addons/MarkerWithLabel';

const CENTER_X_OFFSET = -0.004;

const center = (coords) => {
    let bounds = new google.maps.LatLngBounds();
    for(let i=0; i<coords.length;i++){
        bounds.extend(new google.maps.LatLng(coords[i].lat, coords[i].lng + CENTER_X_OFFSET));
    }
    return bounds.getCenter();
}

const GoogleMapApp = withGoogleMap((props) =>
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

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {width: '0', height: '0' };
    }

    componentDidMount() {
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
    }

    updateWindowDimensions = () => this.setState({width: window.innerWidth, height: window.innerHeight});

    render() {
        return <div><GoogleMapApp
            loadingElement={<div style={{ height: `100%` }} />}
            containerElement={<div style={{ height: this.state.height, width: this.state.width - 300 }} />}
            mapElement={<div style={{ height: `100%` }}
            />}
        >
            {Object.keys(gis).map(pu => {
                return <div key={pu}>
                    <Polygon
                        path={gis[pu]}
                        options={{
                            fillColor: '#000',
                            fillOpacity: 0.2
                        }}
                        onClick={function(){this.setOptions({fillColor: 'red'})}}
                    />
                    <MarkerWithLabel
                        position={center(gis[pu])}
                        labelAnchor={gis[pu][0]}
                        labelStyle={{backgroundColor: "#ccc", fontSize: 10, padding: 2 }}
                        icon='pixel-trans.gif'
                    >
                        <div>{pu}</div>
                    </MarkerWithLabel>
                </div>;
            })}
        </GoogleMapApp><div style={{ padding: 10, position: 'absolute', top: 0, left: this.state.width - 300, width: 300, height: this.state.height}}>Hi</div></div>
    }
}

export default App;