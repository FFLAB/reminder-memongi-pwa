"use strict";

function captureConsoleLog(captureElem) {
  let oldConsoleLog = console.log;

  console.log = function() {
    let message = document.createElement("div");
    for(let i = 0; i < arguments.length; i++) {
      message.innerHTML += arguments[i];
    }
    captureElem.appendChild(message);
    captureElem.scrollTop = captureElem.scrollHeight;
    oldConsoleLog.apply(console, arguments);
  };
}

function addDebug(showConsole) {
  const version = 0.54;
  const footer = document.querySelector("footer");

  if(showConsole) {
    document.documentElement.style.setProperty("--bottom-height", "6em");
    var consoleBox = document.createElement("div");
    consoleBox.setAttribute("id", "console-box");
    footer.appendChild(consoleBox);
    captureConsoleLog(consoleBox);
  }

  var versionSpan = document.createElement("span");
  versionSpan.setAttribute("class", "version");
  versionSpan.innerHTML = "version " + version.toFixed(2);
  footer.appendChild(versionSpan);
}

function fixVerticalHeight() {
  function setVerticalHeight() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  }

  window.onresize = function() {
    setVerticalHeight();
  };

  setVerticalHeight();
}

function saveLocalRemindersData(data) {
  window.localStorage.setItem("remindersData", data);
}

function loadLocalRemindersData() {
  let data = window.localStorage && window.localStorage.getItem("remindersData");
  //??? remove fake data after text backup or app update added, make data const
  if(!data) {
    data = [];
    data.push({date: new Date(2018, 11, 1, 9, 30), note: "Scouting for food"});
    data.push({date: new Date(2018, 11, 8, 9, 0), note: "Gingerbread party"});
    data.push({date: new Date(2018, 11, 9, 17, 0), note: "Holiday express"});
    data = JSON.stringify(data);
  }
  return data;
}

function saveLocalReminders(reminders) {
  const remindersData = JSON.stringify(reminders);
  saveLocalRemindersData(remindersData);
}

function loadLocalReminders() {
  const remindersData = JSON.parse(loadLocalRemindersData());
  console.log(`loaded ${remindersData.length} rems`);
  return remindersData.map(function(data) { return createReminder(data) });
}

function addScrollEvents(box, wrap) {
  let scrollEnabled = false;
  let scrollY = 0;
  let yOffset = 0;

  function enableScroll(enabled, y = 0) {
    scrollEnabled = enabled;
    scrollY = y;
  }

  function moveScroll(y) {
    if(scrollEnabled) {
      yOffset += (y - scrollY);
      scrollY = y;
      const yOffsetMin = box.clientHeight - box.scrollHeight;
      if((yOffsetMin > 0) || (yOffset > 0)) {
        yOffset = 0;
      } else if (yOffset < yOffsetMin) {
        yOffset = yOffsetMin;
      }
      wrap.style.top = yOffset + "px";
    }
  }

  wrap.ontouchstart = function(event) {
    event.preventDefault();
    enableScroll(true, event.touches[0] && event.touches[0].clientY);
  };

  wrap.ontouchmove = function(event) {
    event.preventDefault();
    moveScroll(event.touches[0] && event.touches[0].clientY);
  };

  wrap.ontouchend = function(event) {
    event.preventDefault();
    enableScroll(false);
  };

  wrap.onmousedown = function(event) {
    event.preventDefault();
    enableScroll(true, event.clientY);
  };

  wrap.onmouseup = function(event) {
    event.preventDefault();
    enableScroll(false);
  };

  wrap.onmouseleave = function(event) {
    event.preventDefault();
    enableScroll(false);
  };

  wrap.onmousemove = function(event) {
    event.preventDefault();
    moveScroll(event.clientY);
  };
}

function clearReminders(wrap) {
  wrap.innerHTML = "";
}

function drawReminders(reminders, wrap) {
  //??? refactor to separate draw from edit events
  const options = {weekday:"short", day:"numeric", month:"short", hour:"numeric", minute:"2-digit"};
  const longPressMs = 750;
  const longPressMoveMax = 10;
  let dataUi = {};
  dataUi.month = document.getElementById("month");
  dataUi.day = document.getElementById("day");
  dataUi.day = document.getElementById("day");
  dataUi.note = document.getElementById("note");
  let editBox = document.getElementById("edit-box");
  let addButton = document.getElementById("edit-add");
  let saveButton = document.getElementById("edit-save");
  let removeButton = document.getElementById("edit-remote");
  let startY = 0;
  let timer;

  function editReminder() {
    editBox.setAttribute("data_id", this.getAttribute("data_id"));
    let date = new Date(parseInt(this.getAttribute("data_time")));
    let note = this.querySelector(".note");
    dataUi.note.value = note.innerHTML;
    dataUi.month.value = date.getMonth() + 1;
    dataUi.day.value = date.getDate();
    //???? set data controls in editBox
    console.log("open " + date.toDateString());
    console.log(` ${note.innerHTML}`);
    addButton.style.display = "none";
    saveButton.style.display = "inline-block";
    removeButton.style.display = "inline-block";
    editBox.style.display = "block";
  }

  function longPressStart(event) {
    event.preventDefault();
    startY = event.touches[0] && event.touches[0].clientY;
    timer = setTimeout(editReminder.bind(this), longPressMs);
  }

  function longPressMove(event) {
    event.preventDefault();
    let move = Math.abs((event.touches[0] && event.touches[0].clientY) - startY);
    if(move > longPressMoveMax) {
      if(timer) clearTimeout(timer);
    }
  }

  function longPressEnd(event) {
    event.preventDefault();
    if(timer) clearTimeout(timer);
  }

  clearReminders(wrap);
  reminders.forEach(function(reminder) {
    var reminderElem = document.createElement("div");
    reminderElem.setAttribute("class", "reminder");
    reminderElem.setAttribute("data_id", reminder.id);
    reminderElem.setAttribute("data_time", reminder.date.getTime());
    var untilElem = document.createElement("div");
    untilElem.setAttribute("class", "until");
    untilElem.innerHTML = "2 w\n3 d";
    var dateElem = document.createElement("div");
    dateElem.setAttribute("class", "date");
    dateElem.innerHTML = reminder.date.toLocaleString("en-us", options);
    var noteElem = document.createElement("div");
    noteElem.setAttribute("class", "note");
    noteElem.innerHTML = reminder.note;

    wrap.appendChild(reminderElem);
    reminderElem.appendChild(untilElem);
    reminderElem.appendChild(dateElem);
    reminderElem.appendChild(noteElem);
    reminderElem.ondblclick = editReminder;
    reminderElem.ontouchstart = longPressStart;
    reminderElem.ontouchend = longPressEnd;
    reminderElem.ontouchmove = longPressMove;
  });
}

function addReminderDataEvents(reminders, wrap) {
  let editBox = document.getElementById("edit-box");
  let plusButton = document.getElementById("plus");
  let addButton = document.getElementById("edit-add");
  let saveButton = document.getElementById("edit-save");
  let removeButton = document.getElementById("edit-remote");
  let cancelButton = document.getElementById("edit-cancel");

  plusButton.onclick = function() {
    addButton.style.display = "inline-block";
    saveButton.style.display = "none";
    removeButton.style.display = "none";
    editBox.style.display = "block";
  };

  addButton.onclick = function() {
    editBox.style.display = "none";
    //??? create data object from editBox inputs
    const day = 1 + Math.floor(Math.random() * 31)
    const data = {date: new Date(2018, 11, day), note: `Event for Dec ${day}`};
    console.log(`add '${data.note}'`);
    reminders.push(createReminder(data));
    reminders.sort(reminderByDate);
    drawReminders(reminders, wrap);
    saveLocalReminders(reminders);
  };

  saveButton.onclick = function() {
    editBox.style.display = "none";
    let removeId = parseInt(editBox.getAttribute("data_id"));
    //??? create data object from editBox inputs
    //??? remove reminder with removeId
    console.log(`save ${removeId}, ${reminders.length} rems`);
    //reminders.push(createReminder(data));
    reminders.sort(reminderByDate);
    //drawReminders(reminders, wrap);
    saveLocalReminders(reminders);
  };

  removeButton.onclick = function() {
    editBox.style.display = "none";
    let removeId = parseInt(editBox.getAttribute("data_id"));
    //??? remove reminder with removeId
    console.log(`remove ${removeId}, ${reminders.length} rems`);
    saveLocalReminders(reminders);
  };

  cancelButton.onclick = function() {
    editBox.style.display = "none";
    console.log(`cancel, ${reminders.length} rems`);
  };
}

function addDataEvents(reminders) {
  window.onbeforeunload = function(event) {
    event.preventDefault();
    console.log("bye len=", reminders.length);
  }
}

document.addEventListener("DOMContentLoaded", function() {
  addDebug(false);
  fixVerticalHeight();

  const reminderBox = document.getElementById("reminder-box");
  const reminderWrap= document.getElementById("reminder-wrap");
  addScrollEvents(reminderBox, reminderWrap);

  let reminders = loadLocalReminders();
  drawReminders(reminders, reminderWrap);

  addReminderDataEvents(reminders, reminderWrap);
  addDataEvents(reminders);
});
