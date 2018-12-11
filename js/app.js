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

function loadStartupRemindersData() {
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
  return JSON.stringify(data);
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

function untilClass(from, to) {
  const oneDay = 1000 * 60 * 60 * 24;
  const oneWeek = 7 * oneDay;
  const oneMonth = 30 * oneDay;

  let diff = (to - from);
  if(diff > oneMonth) {
    return "until-future";
  } else if(diff > oneWeek) {
    return "until-month";
  } else if(diff > oneDay) {
    return "until-week";
  } else if(diff > 0) {
    return "until-day";
  } else {
    return "until-past";
  }
}

function untilText(from , to) {
  let rows = [];
  if(to - from > 0) {
    let dyear = to.getFullYear() - from.getFullYear();
    let dmonth = to.getMonth() - from.getMonth();
    if(dmonth < 0) {
      dyear -= 1;
      dmonth += 12
    }
    let dday = to.getDate() - from.getDate();
    if(dday < 0) {
      dmonth -= 1;
      dday += new Date(to.getFullYear(), to.getMonth() + 1, 0).getDate();
    }
    let dweek = parseInt(dday / 7);
    dday = dday % 7;

    if(dyear > 0) {
      rows.push(dyear + " year" + (dyear > 1 ? "s" : ""));
    }
    if(dmonth > 0) {
      rows.push(dmonth + " mo" + (dmonth > 1 ? "s." : "."));
    }
    if(dweek > 0) {
      rows.push(dweek + " week" + (dweek > 1 ? "s" : ""));
    }
    if(dday > 0) {
      rows.push(dday + " day" + (dday > 1 ? "s" : ""));
    } else if(rows.length == 0) {
      rows.push("today");
    }
  } else {
    rows.push("past");
  }

  const rowCount = 2;
  while(rows.length < rowCount) {
    rows.push("");
  }
  return `<span>${rows[0]}</span><span>${rows[1]}</span>`;
}

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

function drawReminders(reminders, wrap) {
  //???? refactor to separate draw from edit events, add createReminderUi factory
  const longPressMs = 750;
  const longPressMoveMax = 10;
  let editUi = getEditUi();
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
    editUi = writeEditUi(editUi, {date: date, note: note.innerHTML});
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
    let reminderUi = createReminderUi(reminder);
    reminderUi.ondblclick = editReminder;
    reminderUi.ontouchstart = longPressStart;
    reminderUi.ontouchend = longPressEnd;
    reminderUi.ontouchmove = longPressMove;
    wrap.appendChild(reminderUi);
  });
}

function getEditUi() {
  return {
    year: document.getElementById("year"),
    month: document.getElementById("month"),
    day: document.getElementById("day"),
    hours: document.getElementById("hours"),
    minutes: document.getElementById("minutes"),
    am: document.getElementById("am"),
    pm: document.getElementById("pm"),
    duration: document.getElementById("duration"),
    note: document.getElementById("note")
  };
}

function readEditUi(ui) {
  let date = new Date();
  date.setFullYear(parseInt(ui.year.value));
  date.setMonth(parseInt(ui.month.value - 1));
  date.setDate(parseInt(ui.day.value));
  const hasTime = !!ui.hours.value;
  const isPm = ui.pm.checked;
  date.setHours(hasTime ? (parseInt(ui.hours.value) + (isPm ? 12 : 0)) : 0);
  date.setMinutes((hasTime && ui.minutes.value) ? parseInt(ui.minutes.value) : 0);
  date.setSeconds(hasTime ? 1 : 0);
  date.setMilliseconds((hasTime && ui.duration.value) ? parseInt(ui.duration.value) : 0);
  return {date: date, note: ui.note.value};
}

function writeEditUi(ui, data) {
  const useTime = (data.date.getSeconds() > 0);
  const useDuration = (data.date.getMilliseconds() > 0);
  const hours = data.date.getHours() % 12 || 12;
  const minutes = ("0" + data.date.getMinutes()).slice(-2);
  const isPm = data.date.getHours() > 11;
  ui.year.value = data.date.getFullYear();
  ui.month.value = data.date.getMonth() + 1;
  ui.day.value = data.date.getDate();
  ui.hours.value = (useTime ? hours : "");
  ui.minutes.value = (useTime ? minutes : "");
  ui.am.checked = useTime && !isPm;
  ui.pm.checked = useTime && isPm;
  ui.duration.value = (useDuration && useTime ? data.date.getMilliseconds() : "");
  ui.note.value = data.note;
  return ui;
}

function clearEditUi(ui) {
  ui.year.value = "";
  ui.month.value = "";
  ui.day.value = "";
  ui.hours.value = "";
  ui.minutes.value = "";
  ui.am.checked = false;
  ui.pm.checked = false;
  ui.duration.value = "";
  ui.note.value = "";
  return ui;
}

function addReminderDataEvents(reminders, wrap) {
  let editBox = document.getElementById("edit-box");
  let plusButton = document.getElementById("plus");
  let addButton = document.getElementById("edit-add");
  let saveButton = document.getElementById("edit-save");
  let removeButton = document.getElementById("edit-remote");
  let cancelButton = document.getElementById("edit-cancel");
  let editUi = getEditUi();

  //???? clean out comments, functionalize
  plusButton.onclick = function() {
    editUi = clearEditUi(editUi);
    const now = new Date();
    editUi.year.value = now.getFullYear();
    editUi.month.value = now.getMonth() + 1;
    addButton.style.display = "inline-block";
    saveButton.style.display = "none";
    removeButton.style.display = "none";
    editBox.style.display = "block";
  };

  addButton.onclick = function() {
    editBox.style.display = "none";
    reminders.push(createReminder(readEditUi(editUi)));
    reminders.sort(reminderByDate);
    drawReminders(reminders, wrap);
    saveLocalReminders(reminders);
  };

  saveButton.onclick = function() {
    editBox.style.display = "none";
    const removeId = parseInt(editBox.getAttribute("data_id"));
    reminders = reminders.filter(reminder => reminder.id != removeId);
    reminders.push(createReminder(readEditUi(editUi)));
    reminders.sort(reminderByDate);
    drawReminders(reminders, wrap);
    saveLocalReminders(reminders);
  };

  removeButton.onclick = function() {
    editBox.style.display = "none";
    let removeId = parseInt(editBox.getAttribute("data_id"));
    reminders = reminders.filter(reminder => reminder.id != removeId);
    saveLocalReminders(reminders);
    drawReminders(reminders, wrap);
  };

  cancelButton.onclick = function() {
    editBox.style.display = "none";
  };
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

  const updateButton = document.getElementById("update");
  updateButton.onclick = function() {
    const cacheName = "reminder-cache";
    if(navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage("update-cache");
        console.log("sent update message");
      } else {
        console.log("could not send message: no service worker");
      }
  };
});
