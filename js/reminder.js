"use strict";

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

function createReminder(data) {
  let reminder = Object.create(reminderPrototype)
  reminder.date = new Date(data.date);
  reminder.note = data.note;
  reminder.id = reminderNextId++; 

  return reminder;
}

function Events() {
  let events = []
  let nextId = 0;

  function add(time, note) {
    let event = Object.create(null);
    console.log(`add t=${time} n=${note}`);
    event.time = time;
    event.note = note;
    event.id = nextId++;
    //??? sort
    events.push(event);
  }

  function remove(time, id) {
    console.log(`rem d=${time} n=${note}`);
  }

  function all() {
    return events;
  }

  function defaultData() {
    let stored = window.localStorage && window.localStorage.getItem("remindersData");
    let data = [];
    if(stored) {
      console.log("CONVERTED OLD REMINDERS");
      const remindersData = JSON.parse(stored);
      data = remindersData.map((value) => { return { time: new Date(value.date).getTime(), note: value.note }; });
    }
    //???? restore default data, convert to time
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
    //??? clear remindersData once events are saved correctly
    //window.localStorage.setItem("eventsData", data);
  }

  return {
    add: add,
    remove: remove,
    all: all,
    load: load, 
    save: save
  };
}
