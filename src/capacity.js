import React from 'react';
import Dispatcher from "./dispatcher";

export default (props) =>
    <div>
        <label for='capacity' style={{marginRight: 20, width: '5em'}}>Capacity</label>
        <select
            id='capacity'
            onChange={(e) => Dispatcher.dispatch({ action: 'change_capacity', school: props.school, value: e.target.value}) }
            value={props.capacity}
        >
            <option value={850}>850</option>
            <option value={1250}>1250</option>
        </select>
    </div>;