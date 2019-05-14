import React from 'react';
import Dispatcher from "./dispatcher";

export default (props) =>
    <div>
        <label htmlFor='pop' style={{marginRight: 20, width: '5em'}}>School Planning For: </label>
        <select
            name='pop'
            onChange={(e) => Dispatcher.dispatch({ action: 'change_pop', value: e.target.value}) }
            value={props.pop}
        >
            <option value={'EE-5th'}>Elementary</option>
            <option value={'6th-8th'}>Middle</option>
            <option value={'9th-12th'}>High</option>
        </select>
    </div>;