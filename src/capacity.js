import React from 'react';
import Dispatcher from "./dispatcher";

export default (props) =>
    <div>
        <label htmlFor='capacity' style={{marginRight: 20, width: '5em'}}>Capacity</label>
        <select
            name='capacity'
            onChange={(e) => Dispatcher.dispatch({ action: 'change_capacity', school: props.school, value: e.target.value}) }
            value={props.capacity}
        >
            <option value={850}>850</option>
            <option value={1250}>1250</option>
            <option value={2000}>2000</option>
        </select>
    </div>;