import React, {Component} from 'react';
import GoogleMapApp from './googlemapapp';
import PlanningUnits from './planningunits';
import Schools from './schools';
import Controls from './controls';
import GisData from './gis.json';
import _ from 'lodash';
import Dispatcher from './dispatcher';
import Papa from 'papaparse';

const SIDEBAR_WIDTH = 350;

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            width: '0',
            height: '0',
            customSchools: undefined,
            customPopulation: undefined,
            planningUnits: _.keyBy(Object.keys(GisData).map((k) => { return { id: k, color: undefined }; } ), 'id'),
        };
    }

    restore = (payload) => {
        if(payload.action !== 'restore'){
            return;
        }
        let saves = localStorage.getItem('saves') ? JSON.parse(localStorage.getItem('saves')) : {};
        let save = saves[payload.restoreDate];
        if(save) {
            this.setState(save, () => Dispatcher.dispatch({action: 'saves_updated', saveDates: Object.keys(saves)}));
        } else {
            console.log('Error restoring save from date: ' + payload.restoreDate);
        }
    }

    save = (payload) => {
        if(payload.action !== 'save'){
            return;
        }
        let saves = localStorage.getItem('saves') ? JSON.parse(localStorage.getItem('saves')) : {};
        saves[new Date().toISOString()] = _.omit(this.state, ['width', 'height']);
        localStorage.setItem('saves', JSON.stringify(saves, (k, v) => v === undefined ? null : v));
        this.setState({}, () => Dispatcher.dispatch({action: 'saves_updated', saveDates: Object.keys(saves)}));
    }

    uploadPopulation = (payload) => {
        if(payload.action !== 'upload_population'){
            return;
        }
        Papa.parse(payload.file, {
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
                this.setState({data: _.keyBy(data, 'pu'), years: years, customPopulation: payload.custom }, ()=> payload.next && Dispatcher.dispatch((payload.next)));
            }
        });
    }

    uploadSchools = (payload) => {
        if(payload.action !== 'upload_schools'){
            return;
        }
        Papa.parse(payload.file, {
            header: true,
            download: true,
            skipEmptyLines: true,
            complete: (result) => {
                let planningUnits = this.state.planningUnits;
                _.forEach(planningUnits, (v, k) => v.color = undefined );
                let data = _.values(result.data).map((row) => _.transform(row, (result, value, key) => {
                    let k = _.trim(key);
                    switch(k){
                        case 'lat':
                        case 'lng':
                            result[k] = parseFloat(value);
                            break;
                        case 'cap':
                            result[k] = _.toInteger(value);
                            break;
                        default:
                            result[k] = _.trim(value);
                    }
                }, {}));
                data =  _.keyBy(data, 'id');
                _.forEach(data, (v) => v['position'] = {lat: v.lat, lng: v.lng});
                this.setState({
                    schoolData: data,
                    planningUnits: planningUnits,
                    schools: _.keyBy(Object.keys(data).map((k) => { return { id: k, active: true, pus: [] }; } ), 'id'),
                    customSchools: payload.custom
                }, ()=> payload.next && Dispatcher.dispatch((payload.next)));
            }
        });
    }

    setDefault = (payload) => {
        if(payload.action !== 'set_default'){
            return;
        };
        let schools = this.state.schools;
        let planningUnits = this.state.planningUnits;
        _.forEach(schools, (school) => school.pus = []);
        // Specific to Middle School Planning 2018
        if(schools['ssm'] && schools['dsm']) {
            schools['ssm'].pus = ['34b', '36', '37a', '37b', '38', '39', '40', '41', '42', '43a', '43b', '44', '45', '46', '47'];
            schools['dsm'].pus = _.xor(Object.keys(GisData), schools['ssm'].pus);
            _.forEach(schools['dsm'].pus, (pu) => planningUnits[pu].color = this.state.schoolData['dsm'].color);
            _.forEach(schools['ssm'].pus, (pu) => planningUnits[pu].color = this.state.schoolData['ssm'].color);
        }
        this.setState({schools: schools, planningUnits: planningUnits});
    }

    togglePlanningUnit = (payload) => {
        if(payload.action !== 'toggle_pu'){
            return;
        }
        let orderedSchools = Object.keys(this.state.schools).sort();
        let nextSchool = orderedSchools[0];
        for(let i=0; i < orderedSchools.length; i++) {
            let schoolPlanningUnits = this.state.schools[orderedSchools[i]].pus;
            if(schoolPlanningUnits.includes(payload.pu)){
                _.remove(schoolPlanningUnits, (pu) => pu === payload.pu);
                if(i+1 !== orderedSchools.length) {
                    nextSchool = orderedSchools[i + 1];
                }
            }
        }
        let planningUnits = this.state.planningUnits;
        let schools = this.state.schools;
        planningUnits[payload.pu].color = this.state.schoolData[nextSchool].color;
        schools[nextSchool].pus.push(payload.pu);
        this.setState({schools: schools, planningUnits: planningUnits });
    }

    componentDidMount() {
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
        this.toggle_pu_token = Dispatcher.register(this.togglePlanningUnit);
        this.set_default_token = Dispatcher.register(this.setDefault);
        this.upload_population_token = Dispatcher.register(this.uploadPopulation);
        this.upload_schools_token = Dispatcher.register(this.uploadSchools);
        this.restore_token = Dispatcher.register(this.restore);
        this.save_token = Dispatcher.register(this.save);
        Dispatcher.dispatch({
            action: 'upload_schools',
            file: require('./schools.csv'),
            next: {
                action: 'upload_population',
                file: require('./students.csv'),
                next: {action: 'set_default'}
            }
        });
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
        Dispatcher.unregister(this.toggle_pu_token);
        Dispatcher.unregister(this.set_default_token);
        Dispatcher.unregister(this.upload_population_token);
        Dispatcher.unregister(this.upload_schools_token);
        Dispatcher.unregister(this.restore_token);
        Dispatcher.unregister(this.save_token);
    }

    updateWindowDimensions = () => this.setState({width: window.innerWidth, height: window.innerHeight});

    render() {
        if(this.state.data === undefined || this.state.schoolData === undefined){
            return (<div>Loading...</div>);
        }
        let customPopulation = this.state.customPopulation && <div style={{width: '100%', backgroundColor: '#00F', color: '#FFF', marginBottom: 10}}>Using {this.state.customPopulation}</div>;
        let customSchools = this.state.customSchools && <div style={{width: '100%', backgroundColor: '#00F', color: '#FFF', marginBottom: 10}}>Using {this.state.customSchools}</div>;
        return (<div>
            <GoogleMapApp
                loadingElement={<div style={{ height: `100%` }} />}
                containerElement={<div style={{ height: this.state.height, width: this.state.width - SIDEBAR_WIDTH }} />}
                mapElement={<div style={{ height: `100%` }} />} >
                <PlanningUnits gis={GisData} planningUnitsState={this.state.planningUnits} />
                <Schools schools={this.state.schoolData}  />
            </GoogleMapApp>
            <Controls
                style={{ fontSize: 10, padding: 10, position: 'absolute', top: 0, left: this.state.width - SIDEBAR_WIDTH, width: SIDEBAR_WIDTH, height: this.state.height}}
                schools={this.state.schoolData}
                years={this.state.years}
                schoolState={this.state.schools}
                data={this.state.data}>
                {customPopulation}
                {customSchools}
            </Controls>
        </div>);
    }
}

export default App;