import React from 'react';
import ReactDOM from 'react-dom';

import Hello from './component'

main();

function main() {
    ReactDOM.render(<Hello data-test="test"></Hello>, document.getElementById('app'));
}
