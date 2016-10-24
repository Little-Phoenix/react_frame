import update from 'react-addons-update';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';

const initialArray = [1,2,3];
const newArray = update(initialArray, { $push: [4] });

const collection = [1, 2, {a: [12, 17, 15]}];
const newCollection = update(collection, {2: {a: {$splice: [[1, 1, 13, 14]]}}});

console.log(collection);
console.log(newCollection);

const obj = {a: 5, b: 3};
const newObj = update(obj, {b: {$apply: function(x) {return x * 2;}}});
// => {a: 5, b: 6}
// This is equivalent, but gets verbose for deeply nested collections:
const newObj2 = update(obj, {b: {$set: obj.b * 2}});

console.log(newObj);
console.log(newObj2);

const obj1 = {a: 5, b: 3};
const newObj1 = update(obj1, { $merge: {b: 6, c: 7}});

console.log(newObj1);

ReactDOM.render(
  <div>
    <div>{initialArray} push后</div>
    <div>{newArray}</div>
    <br/>

  </div>,
  document.getElementById('root')
)
