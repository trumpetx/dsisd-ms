import React, {Component} from 'react';
import Dispatcher from "./dispatcher";


class SaveAndRestore extends Component {
    constructor(props){
        super(props);
        let saves = localStorage.getItem('saves');
        let saveDates = saves ? Object.keys(JSON.parse(saves)) : [];
        this.state = { saveDates: saveDates };
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
                    {this.state.saveDates.map((dt) => <option key={dt} value={dt}>{new Date(dt).toLocaleDateString()} {new Date(dt).toLocaleTimeString()}</option>)}
                </select>
            </div>;
        let clearSaves = this.state.saveDates.length > 0 && <button onClick={() => {
                localStorage.clear();
                this.setState({saveDates: []});
            } }>Clear All Saves</button>;
        return <div>
            <div>
                <button onClick={() => Dispatcher.dispatch({ action: 'set_default'}) }>2017-18 Planning Units</button>
            </div>
            <br/>
            <div>
                <button style={{marginRight: 50}} onClick={() => Dispatcher.dispatch({ action: 'save'}) }>Save</button>
                {clearSaves}
            </div>
            <br/>
            {restoreSaves}
        </div>;
    }
}

export default SaveAndRestore;