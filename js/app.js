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
  const version = 0.79;
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
    data.push({date: new Date(2018, 11, 1, 9, 30, 1, 120), note: "Scouting for food"});
    data.push({date: new Date(2018, 11, 8, 9, 0, 1, 180), note: "Gingerbread party"});
    data.push({date: new Date(2018, 11, 9, 17, 0, 1), note: "Holiday express"});
    data.push({date: new Date(2018, 11, 10), note: "Group project"});
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
  dataUi.year = document.getElementById("year");
  dataUi.month = document.getElementById("month");
  dataUi.day = document.getElementById("day");
  dataUi.hours = document.getElementById("hours");
  dataUi.minutes = document.getElementById("minutes");
  dataUi.am = document.getElementById("am");
  dataUi.pm = document.getElementById("pm");
  dataUi.duration = document.getElementById("duration");
  dataUi.note = document.getElementById("note");
  let editBox = document.getElementById("edit-box");
  let addButton = document.getElementById("edit-add");
  let editButton = document.getElementById("edit-save");
  let removeButton = document.getElementById("edit-remote");
  let startY = 0;
  let timer;

  function editReminder() {
    editBox.setAttribute("data_id", this.getAttribute("data_id"));
    let date = new Date(parseInt(this.getAttribute("data_time")));
    dataUi.year.value = date.getFullYear();
    dataUi.month.value = date.getMonth() + 1;
    dataUi.day.value = date.getDate();
    const useTime = (date.getSeconds() > 0);
    const useDuration = (date.getMilliseconds() > 0);
    const hours = date.getHours() % 12 || 12;
    const minutes = ("0" + date.getMinutes()).slice(-2);
    const isPm = date.getHours() > 11;
    dataUi.hours.value = (useTime ? hours : "");
    dataUi.minutes.value = (useTime ? minutes : "");
    dataUi.am.checked = useTime && !isPm;
    dataUi.pm.checked = useTime && isPm;
    dataUi.duration.value = (useDuration && useTime ? date.getMilliseconds() : "");
    let note = this.querySelector(".note");
    dataUi.note.value = note.innerHTML;
    console.log(`open, ${date.toDateString()}, ${note.innerHTML}`);
    addButton.style.display = "none";
    editButton.style.display = "inline-block";
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
  let editButton = document.getElementById("edit-save");
  let removeButton = document.getElementById("edit-remote");
  let cancelButton = document.getElementById("edit-cancel");
  let dataUi = {};
  dataUi.year = document.getElementById("year");
  dataUi.month = document.getElementById("month");
  dataUi.day = document.getElementById("day");
  dataUi.hours = document.getElementById("hours");
  dataUi.minutes = document.getElementById("minutes");
  dataUi.am = document.getElementById("am");
  dataUi.pm = document.getElementById("pm");
  dataUi.duration = document.getElementById("duration");
  dataUi.note = document.getElementById("note");

  plusButton.onclick = function() {
    let date = new Date();
    date.setDate(date.getDate() + 7);
    dataUi.year.value = date.getFullYear();
    dataUi.month.value = date.getMonth() + 1;
    dataUi.day.value = date.getDate();
    dataUi.hours.value = "";
    dataUi.minutes.value = "";
    dataUi.am.checked = false;
    dataUi.pm.checked = false;
    dataUi.duration.value = "";
    dataUi.note.value = "";
    addButton.style.display = "inline-block";
    editButton.style.display = "none";
    removeButton.style.display = "none";
    editBox.style.display = "block";
  };

  addButton.onclick = function() {
    editBox.style.display = "none";
    let date = new Date();
    date.setFullYear(parseInt(dataUi.year.value));
    date.setMonth(parseInt(dataUi.month.value - 1));
    date.setDate(parseInt(dataUi.day.value));
    const hasTime = !!dataUi.hours.value;
    const isPm = dataUi.pm.checked;
    date.setHours(hasTime ? (parseInt(dataUi.hours.value) + (isPm ? 12 : 0)) : 0);
    date.setMinutes((hasTime && dataUi.minutes.value) ? parseInt(dataUi.minutes.value) : 0);
    date.setSeconds(hasTime ? 1 : 0);
    date.setMilliseconds((hasTime && dataUi.duration.value) ? parseInt(dataUi.duration.value) : 0);
    const data = {date: date, note: dataUi.note.value};
    console.log(`add '${data.note}'`);
    reminders.push(createReminder(data));
    reminders.sort(reminderByDate);
    drawReminders(reminders, wrap);
    saveLocalReminders(reminders);
  };

  editButton.onclick = function() {
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
    let index = 0;
    let found = false;
    while(!found && (index < reminders.length)) {
      if(reminders[index].id == removeId) {
        found = true;
      } else {
        index++;
      }
    }
    if(found) {
      console.log("remove i=" + index + " id=" + reminders[index].id + ", " + reminders[index].note);
      reminders.splice(index, 1);
    }
    console.log(`remove, ${reminders.length} rems`);
    saveLocalReminders(reminders);
    drawReminders(reminders, wrap);
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
  addDebug(true);
  fixVerticalHeight();

  const reminderBox = document.getElementById("reminder-box");
  const reminderWrap= document.getElementById("reminder-wrap");
  addScrollEvents(reminderBox, reminderWrap);

  let reminders = loadLocalReminders();
  drawReminders(reminders, reminderWrap);

  addReminderDataEvents(reminders, reminderWrap);
  addDataEvents(reminders);

  const updateButton = document.getElementById("update");
  updateButton.onclick = function() {
    const cacheName = "reminder-cache";
    if(navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage("update-cache");
        console.log("update sent message");
      } else {
        console.log("no service worker");
      }
  };
});
