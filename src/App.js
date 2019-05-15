import React, {Component} from 'react';
import GoogleMapApp from './googlemapapp';
import PlanningUnits from './planningunits';
import Schools from './schools';
import Controls from './controls';
import GisData from './gis.json';
import _ from 'lodash';
import Dispatcher from './dispatcher';
import Papa from 'papaparse';

const SIDEBAR_WIDTH = 400;

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            width: '0',
            height: '0',
            customSchools: undefined,
            customPopulation: undefined,
            planningUnits: _.keyBy(Object.keys(GisData).map((k) => { return { id: k, color: undefined }; } ), 'id'),
            pop: 'EE-5th',
            contextStyle: { display: 'none' },
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
        saves[(_.isEmpty(payload.label) ? this.state.pop : payload.label) + '~' + new Date().toISOString()] = _.omit(this.state, ['width', 'height']);
        localStorage.setItem('saves', JSON.stringify(saves, (k, v) => v === undefined ? null : v));
        this.setState({}, () => Dispatcher.dispatch({action: 'saves_updated', saveDates: Object.keys(saves)}));
    }

    uploadPopulation = (payload) => {
        if(payload.action !== 'upload_population'){
            return;
        }
        Papa.parse(payload.file, {
            header: false,
            download: true,
            skipEmptyLines: true,
            complete: (result) => {
                result = result.data;
                let years = result[0];
                const headers = result[1];
                const data = [];
                for(let i = 2; i < result.length; i++){
                    const entry = { pu: result[i][0].toLowerCase() };
                    for(let h = 1; h < headers.length; h++){
                        if(headers[h] === this.state.pop){
                            entry[years[h]] = _.toInteger(result[i][h]);
                        }
                    }
                    data.push(entry);
                }
                years = _.union(_.slice(years, 1));
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
                data =  _.keyBy(_.filter(data, ['pop', this.state.pop]), 'id');
                _.forEach(data, (v) => v['position'] = {lat: v.lat, lng: v.lng});
                this.setState({
                    schoolData: data,
                    planningUnits: planningUnits,
                    schools: _.keyBy(Object.keys(data).map((k) => { return { id: k, active: true, pus: [] }; } ), 'id'),
                    customSchools: payload.custom
                }, ()=> payload.next && Dispatcher.dispatch(payload.next));
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
        if(schools['dsm']) {
            schools['ssm'].pus = ['34b', '36', '37a', '37b', '38', '39', '40', '41', '42', '43a', '43b', '44', '45', '46', '47'];
            schools['dsm'].pus = _.xor(Object.keys(GisData), schools['ssm'].pus);
        } else if(schools['dshs']){
            schools['dshs'].pus = Object.keys(GisData);
        } else if(schools['dse']) {
            schools['roe'].pus = ['37a', '37b'];
            schools['sse'].pus = ['36', '34b', '43a', '41', '42', '43b', '44', '45', '40', '46', '38', '39', '47'];
            schools['dse'].pus = ['2', '4', '5', '11', '12', '13', '15', '16', '17', '18', '19', '20a', '20b', '35'];
            schools['wse'].pus = _.xor(Object.keys(GisData), _.concat(schools['roe'].pus, schools['sse'].pus, schools['dse'].pus));
        }
        Object.keys(schools).forEach(k => _.forEach(schools[k].pus, (pu) => planningUnits[pu].color = this.state.schoolData[k].color));
        this.setState({schools: schools, planningUnits: planningUnits});
    }

    changePu = (payload) => {
        const orderedSchools = Object.keys(this.state.schools).sort();
        const nextSchool = payload.nextSchool;
        for(let i=0; i < orderedSchools.length; i++) {
            const schoolPlanningUnits = this.state.schools[orderedSchools[i]].pus;
            if(schoolPlanningUnits.includes(payload.pu)){
                _.remove(schoolPlanningUnits, (pu) => pu === payload.pu);
            }
        }
        const planningUnits = this.state.planningUnits;
        const schools = this.state.schools;
        planningUnits[payload.pu].color = this.state.schoolData[nextSchool].color;
        schools[nextSchool].pus.push(payload.pu);
        this.setState({schools: schools, planningUnits: planningUnits, contextStyle:{ display: 'none' }});
    }

    togglePlanningUnit = (payload) => {
        if(payload.action === 'cancel_pu_change'){
            this.setState({contextStyle:{ display: 'none' }});
        } else if(payload.action === 'change_pu'){
            this.changePu(payload);
        } else if(payload.action === 'toggle_pu'){
            let orderedSchools = Object.keys(this.state.schools).sort();
            let nextSchool = orderedSchools[0];
            for(let i=0; i < orderedSchools.length; i++) {
                const schoolPlanningUnits = this.state.schools[orderedSchools[i]].pus;
                if(schoolPlanningUnits.includes(payload.pu)){
                    if(i+1 !== orderedSchools.length) {
                        nextSchool = orderedSchools[i + 1];
                    }
                }
            }
            this.changePu({pu: payload.pu, nextSchool: nextSchool});
        } else if(payload.action === 'select_pu'){
            this.setState({contextStyle: {
                position: 'absolute',
                display: 'block',
                left: payload.x + 15,
                top: payload.y - 5,
                zIndex: 99,
                borderColor: 'black',
                backgroundColor: '#EEE',
                borderRadius: 5,
                borderWidth: 10,
                padding: 15,
                paddingTop: 12
            }, contextPu: payload.pu});
        }
    }

    changePop = (payload) => {
        if(payload.action !== 'change_pop'){
            return;
        }
        this.setState({pop: payload.value}, this.reset);
    }

    componentDidMount() {
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
        this.tokens = [];
        this.tokens.push(Dispatcher.register(this.togglePlanningUnit));
        this.tokens.push(Dispatcher.register(this.setDefault));
        this.tokens.push(Dispatcher.register(this.uploadPopulation));
        this.tokens.push(Dispatcher.register(this.uploadSchools));
        this.tokens.push(Dispatcher.register(this.restore));
        this.tokens.push(Dispatcher.register(this.save));
        this.tokens.push(Dispatcher.register(this.changePop));
        this.reset();
    }

    reset = () => {
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
        this.tokens.forEach(t => Dispatcher.unregister(t));
        this.tokens = [];
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
                style={{ fontSize: 10, paddingLeft: 20, position: 'absolute', top: 0, left: this.state.width - SIDEBAR_WIDTH, width: SIDEBAR_WIDTH - 37, height: this.state.height}}
                schools={this.state.schoolData}
                years={this.state.years}
                schoolState={this.state.schools}
                data={this.state.data}
                pop={this.state.pop}
                >
                {customPopulation}
                {customSchools}
            </Controls>
            <ContextMenu contextStyle={this.state.contextStyle} schools={this.state.schoolData} pu={this.state.contextPu} />
        </div>);
    }
}

const ContextMenu = (props) => <div style={props.contextStyle}>
    <span onClick={() => Dispatcher.dispatch({action: 'cancel_pu_change'})}style={{cursor: 'pointer', position: 'absolute', right: 5, top: 0, marginRight: 10, marginBottom: 10}}>&#10006;</span>
    <div style={{marginTop: 8}}>
        {Object.keys(props.schools).map(s =><div key={'selector_'+props.schools[s].id}><button style={{width: '100%', opacity: .8, color: props.schools[s].color === '#FFFF00' ? 'black' : 'white', backgroundColor: props.schools[s].color}} onClick={() => Dispatcher.dispatch({ action: 'change_pu', pu: props.pu, nextSchool: s})}>{props.schools[s].label}</button></div>)}
    </div>
</div>;

export default App;