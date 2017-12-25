import React, {Component} from 'react';
import _ from 'lodash';
import Capacity from './capacity';
import Dispatcher from "./dispatcher";

class Controls extends Component {
    constructor(props) {
        super(props);
        this.state = { capacity: { } };
    }

    changeCapacity = (payload) => {
        if(payload.action !== 'change_capacity'){
            return;
        }
        let capactiy = this.state.capacity;
        capactiy[payload.school] = payload.value;
        this.setState({capacity: capactiy});
    }

    componentDidMount() {
        this.change_capacity_token = Dispatcher.register(this.changeCapacity);
    }

    componentWillUnmount() {
        Dispatcher.unregister(this.change_capacity_token);
    }

    render() {
        return (<div style={{fontSize: 10}}>
            <button onClick={() => Dispatcher.dispatch({ action: 'set_default'}) }>Reset</button>
            {Object.keys(this.props.schools).map(school =>
                <div key={school}>
                    <h3>{this.props.schools[school].label}</h3>
                    <Capacity school={school} capacity={this.state.capacity[school] || this.props.schools[school].cap} />
                    {this.props.years.map((y) => {
                        let v = _.sumBy(this.props.schoolState[school].pus, (pu) => this.props.data[pu][y]);
                        let color = '#EEE';
                        let schoolCapacity = this.state.capacity[school] || this.props.schools[school].cap;
                        if(v > 1.2 * schoolCapacity){
                            color = '#F00';
                        } else if (v > schoolCapacity){
                            color = '#FF0';
                        }
                        return <div key={y}>
                            <span style={{width: 100, textAlign: 'right', marginRight: 20}}>{y}:</span>
                            <input style={{width: '5em', backgroundColor: color}} type='text' disabled
                                   value={v}/>
                        </div>
                    })}
                </div>)}
        </div>);
    }
}

export default Controls;
