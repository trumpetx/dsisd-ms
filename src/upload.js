import React from 'react';
import Dispatcher from "./dispatcher";

export default (props) => <div>
    <h3>New Population Numbers</h3>
    <input type="file" onChange={(e) => { Dispatcher.dispatch({ action: 'upload_population', file: e.target.files[0], custom: e.target.files[0].name}); e.target.value = null; }} />
    <br/><br/>
    <div>[ <a download='students.csv' href={require('./students.csv')}>Download Population Template</a> (.csv) ]</div>
    <br/><br/>
    <h3>New School Data</h3>
    <input type="file" onChange={(e) => { Dispatcher.dispatch({ action: 'upload_schools', file: e.target.files[0], custom: e.target.files[0].name}); e.target.value = null; }} />
    <br/><br/>
    <div>[ <a download='schools.csv' href={require('./schools.csv')}>Download School Template</a> (.csv) ]</div>
</div>;