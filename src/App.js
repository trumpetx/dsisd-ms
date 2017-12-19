import React, {Component} from 'react';
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from 'react-google-maps';
import gis from './gis.json';

const MyMapComponent = withScriptjs(withGoogleMap((props) =>
        <GoogleMap
            defaultZoom={12}
            defaultCenter={{ lat: 30.212793, lng: -98.072734 }}
        />
    ));

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {width: '0', height: '0'};
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
        return <MyMapComponent
            googleMapURL='https://maps.googleapis.com/maps/api/js?key=AIzaSyAU0YLntjfDVbpHXbbUw-IMlS7nWLa3O48'
            loadingElement={<div style={{ height: `100%` }} />}
            containerElement={<div style={{ height: this.state.height, width: this.state.width - 300 }} />}
            mapElement={<div style={{ height: `100%` }} />}
        />
    }
}

export default App;