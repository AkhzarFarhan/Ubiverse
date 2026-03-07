// js/firebase.js
// TODO: Firebase — implement real database call
// This module provides Firebase stub functions for development.
// Replace with real Firebase SDK calls when ready.

window.FirebaseDB = {}; // In-memory mock database

function firebaseGet(path) {
  // TODO: Firebase — implement real database call
  // Real: GET https://texter-for-me.firebaseio.com/{path}.json?auth={FB_AUTH}
  const keys = path.split('/').filter(Boolean);
  let obj = window.FirebaseDB;
  for (const k of keys) {
    if (obj == null) return Promise.resolve(null);
    obj = obj[k];
  }
  return Promise.resolve(obj !== undefined ? obj : null);
}

function firebasePost(path, data) {
  // TODO: Firebase — implement real database call
  const keys = path.split('/').filter(Boolean);
  let obj = window.FirebaseDB;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!obj[keys[i]]) obj[keys[i]] = {};
    obj = obj[keys[i]];
  }
  const lastKey = keys[keys.length - 1];
  if (!obj[lastKey]) obj[lastKey] = {};
  // NOTE: Math.random() is sufficient for this mock implementation.
  // Replace with Firebase's built-in push() ID generation when wiring up the real SDK.
  const newKey = 'entry_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
  obj[lastKey][newKey] = data;
  return Promise.resolve({ name: newKey });
}

function firebasePut(path, data) {
  // TODO: Firebase — implement real database call
  const keys = path.split('/').filter(Boolean);
  let obj = window.FirebaseDB;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!obj[keys[i]]) obj[keys[i]] = {};
    obj = obj[keys[i]];
  }
  obj[keys[keys.length - 1]] = data;
  return Promise.resolve(true);
}

function firebasePatch(path, data) {
  // TODO: Firebase — implement real database call
  const keys = path.split('/').filter(Boolean);
  let obj = window.FirebaseDB;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!obj[keys[i]]) obj[keys[i]] = {};
    obj = obj[keys[i]];
  }
  const lastKey = keys[keys.length - 1];
  obj[lastKey] = Object.assign({}, obj[lastKey] || {}, data);
  return Promise.resolve(true);
}

function firebaseDelete(path) {
  // TODO: Firebase — implement real database call
  const keys = path.split('/').filter(Boolean);
  let obj = window.FirebaseDB;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!obj[keys[i]]) return Promise.resolve(true);
    obj = obj[keys[i]];
  }
  delete obj[keys[keys.length - 1]];
  return Promise.resolve(true);
}
