"use strict";
//??? rename to events.js

function createReminderFactory() {
  console.log("createReminderFactory");
}

function reminderByDate(a, b) {
  return a.date.getTime() - b.date.getTime();
}

let reminderNextId = 0;
let reminderPrototype = Object.create(Object.prototype);

reminderPrototype.toData = function() {
  return JSON.stringify(this);
}

function createOld(data) {
  let reminder = Object.create(reminderPrototype)
  reminder.date = new Date(data.date);
  reminder.note = data.note;
  reminder.id = reminderNextId++; 

  return reminder;
}

function Events() {
  let events = []
  let nextId = 0;

  function reminderByDate(a, b) {
    return a.date.getTime() - b.date.getTime();
  }

  function add(time, note) {
    let event = Object.create(null);
    event.time = time;
    event.note = note;
    event.id = nextId++;
    events.push(event);
    //??? sort
    //reminders.sort((a, b) => { return a.time - b.time; });
  }

  function remove(id) {
    events = events.filter(event => event.id != id);
    //???? remove log
    console.log(`rem id=${id}`);
  }

  function all() {
    return events;
  }

  function defaultData() {
    let stored = window.localStorage && window.localStorage.getItem("remindersData");
    let data = [];
    if(stored) {
      const remindersData = JSON.parse(stored);
      console.log(`CONVERTED ${remindersData.length} OLD REMINDERS`);
      data = remindersData.map((value) => { return { time: new Date(value.date).getTime(), note: value.note }; });
    }
    //??? restore default data after update, convert to times
    /*
    let dayAgo = new Date();
    dayAgo.setDate(dayAgo.getDate() - 1);
    let today = new Date();
    today.setHours(today.getHours() + 18);
    let thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() + 3);
    let thisMonth = new Date();
    thisMonth.setDate(thisMonth.getDate() + 14);
    let later0 = new Date();
    later0.setDate(thisMonth.getDate() + 60);
    let later1 = new Date();
    later1.setDate(thisMonth.getDate() + 90);

    let data = [];
    data.push({date: dayAgo, note: "This is already past"});
    data.push({date: today, note: "This is within the next day"});
    data.push({date: thisWeek, note: "This is within the next week"});
    data.push({date: thisMonth, note: "This is within the next month"});
    data.push({date: later0, note: "Press the plus button to add a reminder"});
    data.push({date: later1, note: "Long press a reminder to edit or remove it"});
    */
    return data;
  }

  function load() {
    let stored = window.localStorage && window.localStorage.getItem("eventsData");
    let data;
    if(stored) {
      data = JSON.parse(stored);
    } else {
      data = defaultData();
    }
    data.forEach(function(value) { return add(value.time, value.note) });
  }

  function save() {
    if(window.localStorage) {
      const data = JSON.stringify(events);
      window.localStorage.setItem("eventsData", data);
      console.log(`save (${events.length})`);
    }
  }

  return {
    add: add,
    remove: remove,
    all: all,
    load: load, 
    save: save
  };
}
