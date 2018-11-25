function captureConsoleLog(captureElem) {
  let oldConsoleLog = console.log;

  console.log = function() {
    message = document.createElement("div");
    for(let i = 0; i < arguments.length; i++) {
      message.innerHTML += arguments[i];
    }
    captureElem.appendChild(message);
    captureElem.scrollTop = captureElem.scrollHeight;
    oldConsoleLog.apply(console, arguments);
  };
}

function addDebug(showConsole) {
  const version = 0.47;

    const versionElem = document.getElementById("version");
    versionElem.innerHTML = "version " + version.toFixed(2);

  if(showConsole) {
    const footer = document.querySelector("footer");
    var consoleBox = document.createElement("div");
    consoleBox.setAttribute("id", "console-box");
    footer.appendChild(consoleBox);
    captureConsoleLog(consoleBox);
  }
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

function loadLocalRemindersData() {
  let data = [];
  data.push({date: new Date(2018, 11, 1, 9, 30), note: "Scouting for food"});
  data.push({date: new Date(2018, 11, 8, 9, 0), note: "Gingerbread party"});
  data.push({date: new Date(2018, 11, 9, 17, 0), note: "Holiday express"});
  return data;
}

function addScrollEvents(box, all) {
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
      all.style.top = yOffset + "px";
    }
  }

  all.ontouchstart = function(event) {
    event.preventDefault();
    enableScroll(true, event.touches[0] && event.touches[0].clientY);
  };

  all.ontouchmove = function(event) {
    event.preventDefault();
    moveScroll(event.touches[0] && event.touches[0].clientY);
  };

  all.ontouchend = function(event) {
    event.preventDefault();
    enableScroll(false);
  };

  all.onmousedown = function(event) {
    event.preventDefault();
    enableScroll(true, event.clientY);
  };

  all.onmouseup = function(event) {
    event.preventDefault();
    enableScroll(false);
  };

  all.onmouseleave = function(event) {
    event.preventDefault();
    enableScroll(false);
  };

  all.onmousemove = function(event) {
    event.preventDefault();
    moveScroll(event.clientY);
  };
}

function clearReminders(all) {
  all.innerHTML = "";
}

function drawReminders(reminders, all) {
  const options = {weekday:"short", day:"numeric", month:"short", hour:"numeric", minute:"2-digit"};
  const longPressMs = 750;
  const longPressMoveMax = 10;
  let dataBox = document.getElementById("data-box");
  let addButton = document.getElementById("add");
  let saveButton = document.getElementById("save");
  let removeButton = document.getElementById("remove");
  let startY = 0;
  let timer;

  function editReminder() {
    dataTime = parseInt(this.getAttribute("data_time"));
    console.log("open " + (new Date(dataTime)).toDateString());
    addButton.style.display = "none";
    saveButton.style.display = "inline-block";
    removeButton.style.display = "inline-block";
    dataBox.style.display = "block";
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

  clearReminders(all);
  reminders.forEach(function(reminder) {
    var reminderElem = document.createElement("div");
    reminderElem.setAttribute("class", "reminder");
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

    all.appendChild(reminderElem);
    reminderElem.appendChild(untilElem);
    reminderElem.appendChild(dateElem);
    reminderElem.appendChild(noteElem);
    reminderElem.ondblclick = editReminder;
    reminderElem.ontouchstart = longPressStart;
    reminderElem.ontouchend = longPressEnd;
    reminderElem.ontouchmove = longPressMove;
  });
}

function addReminderDataEvents(reminders, all) {
  let dataBox = document.getElementById("data-box");
  let plusButton = document.getElementById("plus");
  let addButton = document.getElementById("add");
  let saveButton = document.getElementById("save");
  let removeButton = document.getElementById("remove");
  let cancelButton = document.getElementById("cancel");

  plusButton.onclick = function() {
    addButton.style.display = "inline-block";
    saveButton.style.display = "none";
    removeButton.style.display = "none";
    dataBox.style.display = "block";
  }

  addButton.onclick = function() {
    const day = 1 + Math.floor(Math.random() * 31)
    data = {date: new Date(2018, 11, day), note: `Event for Dec ${day}`};
    reminders.push(createReminder(data));
    drawReminders(reminders, all);
    dataBox.style.display = "none";
  }

  saveButton.onclick = function() {
    //??? remove current, create new and add
    console.log("save");
    dataBox.style.display = "none";
  }

  removeButton.onclick = function() {
    //??? remove current
    console.log("remove");
    dataBox.style.display = "none";
  }

  cancelButton.onclick = function() {
    dataBox.style.display = "none";
  }
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

  const remindersBox = document.getElementById("reminders-box");
  const allReminders= document.getElementById("all-reminders");
  addScrollEvents(remindersBox, allReminders);

  const remindersData = loadLocalRemindersData();
  reminders = remindersData.map(function(data) { return createReminder(data) });
  drawReminders(reminders, allReminders);

  addReminderDataEvents(reminders, allReminders);
  addDataEvents(reminders);
});
