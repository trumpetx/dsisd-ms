/*global google*/
import React, {Component} from 'react';
import { withGoogleMap, GoogleMap, Polygon } from 'react-google-maps';
import gis from './gis.json';
import schools from './schools.json';
import MarkerWithLabel from 'react-google-maps/lib/components/addons/MarkerWithLabel';
import _ from 'lodash';

const CENTER_X_OFFSET = -0.002;

const YEARS = ['2017', '2018', '2019', '2020', '2021', '2020', '2021', '2022'];

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

const Schools = (props) => Object.keys(props.schools).map((s) =>
        <MarkerWithLabel
            key={s}
            position={props.schools[s].position}
            labelAnchor={new google.maps.Point(0, 0)}
            labelStyle={{backgroundColor: "#ccc", fontSize: 10, padding: 2 }}
            icon='pixel-trans.gif'
        >
            <div>props.schools[s].label</div>
        </MarkerWithLabel>
    );

const PlanningUnits = (props) => Object.keys(gis).map(pu => {
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
            labelAnchor={new google.maps.Point(0, 0)}
            labelStyle={{backgroundColor: "#ccc", fontSize: 10, padding: 2 }}
            icon='pixel-trans.gif'
        >
            <div>{pu.substring(2)}</div>
        </MarkerWithLabel>
    </div>;
});

const Years = (props) =>  props.years.map((y) =>
    <div>
        <span style={{width: 100, textAlign: 'right', marginRight: 20}}>{y}:</span>
        <input key={y} style={{width: '5em', backgroundColor: '#EEE'}} type='text' disabled  value={_.sum(props.planningUnits, (pu) => props.planningUnits[y])} />
    </div>);

const Controls = (props) => Object.keys(props.schools).map(school => <div>
    <h3>{props.schools[school].label}</h3>
    <Years years={props.years} planningUnits={props.schools[school].pus} />
</div>);

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {width: '0', height: '0', schools: schools, years: YEARS };
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
        let activeSchools = _.filter(this.state.schools, (s) => s.active);
        return <div>
            <GoogleMapApp
                loadingElement={<div style={{ height: `100%` }} />}
                containerElement={<div style={{ height: this.state.height, width: this.state.width - 300 }} />}
                mapElement={<div style={{ height: `100%` }} />} >
                <PlanningUnits />
                <Schools schools={this.state.schools}  />
            </GoogleMapApp>
            <div style={{ padding: 10, position: 'absolute', top: 0, left: this.state.width - 300, width: 300, height: this.state.height}}>
                <Controls schools={this.state.schools} years={this.state.years}/>
            </div>
        </div>
    }
}

export default App;