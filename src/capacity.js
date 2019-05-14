import React from 'react';
import Dispatcher from "./dispatcher";

const CAPACITIES = [850, 900, 1250, 2000];

export default (props) =>
    <div>
        <label htmlFor='capacity' style={{marginRight: 20, width: '5em'}}>Capacity</label>
        <select
            name='capacity'
            disabled={CAPACITIES.indexOf(props.capacity) === -1}
            onChange={(e) => Dispatcher.dispatch({ action: 'change_capacity', school: props.school, value: e.target.value}) }
            value={props.capacity}
        >
            {CAPACITIES.indexOf(props.capacity) === -1 
                ? <option key={props.capacity} value={props.capacity}>{props.capacity}</option>
                : CAPACITIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
    </div>;