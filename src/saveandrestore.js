import React, {Component} from 'react';
import Dispatcher from "./dispatcher";

const LABELS = {
    'EE-5th':'Elementary',
    '6th-8th':'Middle',
    '9th-12th':'High'
};

class SaveAndRestore extends Component {
    constructor(props){
        super(props);
        let saves = localStorage.getItem('saves');
        let saveDates = saves ? Object.keys(JSON.parse(saves)) : [];
        this.state = { saveDates: saveDates };
        this.label = React.createRef();
    }

    savesUpdated = (payload) => {
        if(payload.action !== 'saves_updated'){
            return;
        }
        this.setState({saveDates: payload.saveDates});
    }

    componentDidMount() {
        this.saves_updated_token = Dispatcher.register(this.savesUpdated);
    }

    componentWillUnmount() {
        Dispatcher.unregister(this.saves_updated_token);
    }

    render() {
        let restoreSaves = this.state.saveDates.length > 0 && <div>
                <label htmlFor='restore' style={{marginRight: 10}}>Restore Save:</label>
                <select style={{marginRight: 10}} onChange={(e) => { if(!e.target.value) return; Dispatcher.dispatch({ action: 'restore', restoreDate: e.target.value}); e.target.value = ''; }}>
                    <option value=''> - Select a Save - </option>
                    {this.state.saveDates.map((dt) => {
                        const save = dt.split('~');
                        return <option key={dt} value={dt}>{LABELS[save[0]] || save[0]} @ {new Date(save[1]).toLocaleDateString()} {new Date(save[1]).toLocaleTimeString()}</option>
                    })}
                </select>
            </div>;
        let clearSaves = this.state.saveDates.length > 0 && <button onClick={() => {
                localStorage.clear();
                this.setState({saveDates: []});
            } }>Clear All Saves</button>;
        return <div>
            <div>
                <button onClick={() => Dispatcher.dispatch({ action: 'set_default'}) }>2020-21 Planning Units</button>
            </div>
            <br/>
            <div>
                <input type='text' ref={this.label} style={{ width: '100px' }}/> <button style={{marginRight: 50}} onClick={() => Dispatcher.dispatch({ action: 'save', label: this.label.current.value })}>Save</button>
                {clearSaves}
            </div>
            <br/>
            {restoreSaves}
            {restoreSaves && <br/>}
        </div>;
    }
}

export default SaveAndRestore;