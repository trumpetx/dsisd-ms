import React, {Component} from 'react';
import GoogleMapApp from './googlemapapp';
import PlanningUnits from './planningunits';
import Schools from './schools';
import Controls from './controls';
import SchoolData from './schools.json';
import GisData from './gis.json';
import _ from 'lodash';
import Dispatcher from './dispatcher';
import Papa from 'papaparse';

const ORDERED_SCHOOLS = Object.keys(SchoolData).sort();

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            width: '0',
            height: '0',
            schools: _.keyBy(ORDERED_SCHOOLS.map((k) => { return { id: k, active: true, pus: [] }; } ), 'id'),
            planningUnits: _.keyBy(Object.keys(GisData).map((k) => { return { id: k, color: undefined }; } ), 'id'),
        };
    }

    setDefault = (payload) => {
        if(payload.action !== 'set_default'){
            return;
        }
        let schools = this.state.schools;
        let planningUnits = this.state.planningUnits;
        _.forEach(schools, (school) => school.pus = []);
        schools['ssm'].pus = ['34b', '36', '37a', '37b', '38', '39', '40', '41', '42', '43a', '43b', '44', '45', '46', '47' ];
        schools['dsm'].pus = _.xor(Object.keys(GisData), schools['ssm'].pus);
        _.forEach(schools['dsm'].pus, (pu) => planningUnits[pu].color = SchoolData['dsm'].color);
        _.forEach(schools['ssm'].pus, (pu) => planningUnits[pu].color = SchoolData['ssm'].color);
        this.setState({schools: schools, planningUnits: planningUnits});
    }

    togglePlanningUnit = (payload) => {
        if(payload.action !== 'toggle_pu'){
            return;
        }
        let nextSchool = ORDERED_SCHOOLS[0];
        for(let i=0; i < ORDERED_SCHOOLS.length; i++) {
            let schoolPlanningUnits = this.state.schools[ORDERED_SCHOOLS[i]].pus;
            if(schoolPlanningUnits.includes(payload.pu)){
                _.remove(schoolPlanningUnits, (pu) => pu === payload.pu);
                if(i+1 !== ORDERED_SCHOOLS.length) {
                    nextSchool = ORDERED_SCHOOLS[i + 1];
                }
            }
        }
        let planningUnits = this.state.planningUnits;
        let schools = this.state.schools;
        planningUnits[payload.pu].color = SchoolData[nextSchool].color;
        schools[nextSchool].pus.push(payload.pu);
        this.setState({schools: schools, planningUnits: planningUnits });
    }

    componentDidMount() {
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
        this.toggle_pu_token = Dispatcher.register(this.togglePlanningUnit);
        this.set_default_token = Dispatcher.register(this.setDefault);
        Papa.parse(require('./students.csv'), {
            header: true,
            download: true,
            skipEmptyLines: true,
            complete: (result) => {
                let data = _.values(result.data).map((row) => _.transform(row, (result, value, key) => {
                    if(key.toLocaleLowerCase() === 'pu'){
                        result['pu'] = value.toLowerCase();
                    } else {
                        result[key] = _.toInteger(value);
                    }
                }, {}));
                let years = _.slice(result.meta.fields, 1);
                this.setState({data: _.keyBy(data, 'pu'), years: years }, this.setDefault({action:'set_default'}));
            }
        });
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
        Dispatcher.unregister(this.toggle_pu_token);
        Dispatcher.unregister(this.set_default_token);
    }

    updateWindowDimensions = () => this.setState({width: window.innerWidth, height: window.innerHeight});

    render() {
        if(this.state.data === undefined){
            return (<div>Loading...</div>);
        }
        return (<div>
            <GoogleMapApp
                loadingElement={<div style={{ height: `100%` }} />}
                containerElement={<div style={{ height: this.state.height, width: this.state.width - 300 }} />}
                mapElement={<div style={{ height: `100%` }} />} >
                <PlanningUnits gis={GisData} planningUnitsState={this.state.planningUnits} />
                <Schools schools={SchoolData}  />
            </GoogleMapApp>
            <div style={{ padding: 10, position: 'absolute', top: 0, left: this.state.width - 300, width: 300, height: this.state.height}}>
                <Controls schools={SchoolData} years={this.state.years} schoolState={this.state.schools} data={this.state.data} />
            </div>
        </div>);
    }
}

export default App;