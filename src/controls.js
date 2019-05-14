import React, {Component} from 'react';
import _ from 'lodash';
import Capacity from './capacity';
import Pop from './pop';
import SaveAndRestore from './saveandrestore';
import Upload from './upload';
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
        return (<div style={this.props.style}>
            {this.props.children}
            <SaveAndRestore />
            <Pop pop={this.props.pop} />
            {Object.keys(this.props.schools).map(school =>
                <span key={school} style={{width: this.props.style.width / 2, display: 'inline-block'}}>
                    <h3>{this.props.schools[school].label}</h3>
                    <Capacity school={school} capacity={this.state.capacity[school] || this.props.schools[school].cap} />
                    {this.props.years.map((y) => {
                        let v = _.sumBy(this.props.schoolState[school].pus, (pu) => this.props.data[pu][y]);
                        let color = '#EEE';
                        let schoolCapacity = this.state.capacity[school] || this.props.schools[school].cap;
                        if(v > 1.2 * schoolCapacity){
                            color = '#F30';
                        } else if (v > schoolCapacity){
                            color = '#FF0';
                        }
                        return <div key={y}>
                            <span style={{width: 100, textAlign: 'right', marginRight: 20}}>{y}:</span>
                            <input style={{width: '5em', backgroundColor: color}} type='text' disabled
                                   value={v}/>
                        </div>
                    })}
                </span>)}
            <Upload />
            <br/>
            <br/>
            <a href="https://gitlab.com/trumpetx/dsisd2/">Source and instructions</a>
            <br/>
            <br/>
        </div>);
    }
}

export default Controls;
