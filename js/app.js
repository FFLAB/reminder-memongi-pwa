"use strict";

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
  const version = 0.93;
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

  /*
function saveLocalRemindersData(data) {
  window.localStorage.setItem("remindersData", data);
}

function loadLocalRemindersData() {
  let data = window.localStorage && window.localStorage.getItem("remindersData");
  if(!data)
    data = loadStartupRemindersData();
  return data;
}

function saveLocalReminders(reminders) {
  const remindersData = JSON.stringify(reminders);
  saveLocalRemindersData(remindersData);
}

function loadLocalReminders() {
  const remindersData = JSON.parse(loadLocalRemindersData());
  console.log(`loaded ${remindersData.length} reminders`);
  return remindersData.map(function(data) { return createOld(data) });
}

function clearReminders(wrap) {
  wrap.innerHTML = "";
}

  */
  /*
function createReminderUi(reminder) {
  const now = new Date();
  const options0 = {weekday:"short", day:"numeric", month:"short", year:"numeric"};
  const options1 = {hour:"numeric", minute:"2-digit"};
  var ui = document.createElement("div");
  ui.classList.add("reminder");
  ui.classList.add(untilClass(now, reminder.date));
  ui.setAttribute("data_id", reminder.id);
  ui.setAttribute("data_time", reminder.date.getTime());
  var untilElem = document.createElement("div");
  untilElem.setAttribute("class", "until");
  untilElem.innerHTML = untilText(now, reminder.date);
  var dateElem = document.createElement("div");
  dateElem.setAttribute("class", "date");
  let dateSpan0 = document.createElement("span");
  dateSpan0.innerHTML = reminder.date.toLocaleString("en-us", options0);
  let dateSpan1 = document.createElement("span");
  dateSpan1.innerHTML = reminder.date.toLocaleString("en-us", options1);
  dateElem.innerHTML = dateSpan0.outerHTML + dateSpan1.outerHTML;
  var noteElem = document.createElement("div");
  noteElem.setAttribute("class", "note");
  noteElem.innerHTML = reminder.note;

  ui.appendChild(untilElem);
  ui.appendChild(dateElem);
  ui.appendChild(noteElem);
  return ui;
}

*/
  /*
function drawReminders(reminders, wrap) {
  const longPressMs = 750;
  const longPressMoveMax = 10;
  let editUi = getEditUi();
  let removeButton = document.getElementById("edit-remove");
  let startY = 0;
  let timer;

  function editReminder() {
    let date = new Date(parseInt(this.getAttribute("data_time")));
    let note = this.querySelector(".note");
    editUi = writeEditUi(editUi, {date: date, note: note.innerHTML});
    removeButton.style.display = "inline-block";
    editUi.box.setAttribute("data_id", this.getAttribute("data_id"));
    editUi.box.style.display = "block";
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
    let reminderUi = createReminderUi(reminder);
    reminderUi.ondblclick = editReminder;
    reminderUi.ontouchstart = longPressStart;
    reminderUi.ontouchend = longPressEnd;
    reminderUi.ontouchmove = longPressMove;
    wrap.appendChild(reminderUi);
  });
}
*/
  /*

function addReminderDataEvents(reminders, wrap) {
  let saveButton = document.getElementById("edit-save");
  let removeButton = document.getElementById("edit-remove");
  let cancelButton = document.getElementById("edit-cancel");
  let editUi = getEditUi();

  saveButton.onclick = function() {
    removeButton.style.display = "none";
    editUi.box.style.display = "none";
    const removeId = parseInt(editUi.box.getAttribute("data_id"));
    if(removeId >= 0) {
      reminders = reminders.filter(reminder => reminder.id != removeId);
    }
    reminders.push(createOld(readEditUi(editUi)));
    reminders.sort(reminderByDate);
    drawReminders(reminders, wrap);
    saveLocalReminders(reminders);
  };

  removeButton.onclick = function() {
    removeButton.style.display = "none";
    editUi.box.style.display = "none";
    let removeId = parseInt(editUi.box.getAttribute("data_id"));
    if(removeId >= 0) {
      reminders = reminders.filter(reminder => reminder.id != removeId);
    }
    saveLocalReminders(reminders);
    drawReminders(reminders, wrap);
  };

  cancelButton.onclick = function() {
    removeButton.style.display = "none";
    editUi.box.style.display = "none";
  };
}

  */
document.addEventListener("DOMContentLoaded", function() {
  fixVerticalHeight();
  addDebug(false);

  const updateButton = document.getElementById("update");
  addUpdateEvent(updateButton);

  const reminderBox = document.getElementById("reminder-box");
  const reminderWrap= document.getElementById("reminder-wrap");
  addScrollEvents(reminderWrap, reminderBox);

  let events = Events();
  events.load();
  updateReminders(events.all(), reminderWrap);

  let editUi = getEditUi();
  let plusButton = document.getElementById("plus");
  addPlusEvent(plusButton, editUi);
  addLongPressEvent(reminderWrap, editUi);
  addEditEvents(editUi, events, reminderWrap);

  //???? remove below
  //const reminderBox = document.getElementById("reminder-box");
  //const reminderWrap= document.getElementById("reminder-wrap");
  //addScrollEvents(reminderBox, reminderWrap);

  //let reminders = loadLocalReminders();
  //drawReminders(reminders, reminderWrap);

  //addReminderDataEvents(reminders, reminderWrap);
});
