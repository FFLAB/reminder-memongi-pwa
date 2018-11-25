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
  const version = 0.42;

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
  let dataBox = document.getElementById("data-box");
  let addButton = document.getElementById("add");
  let editButton = document.getElementById("edit");
  let removeButton = document.getElementById("remove");
  let timer;

  function editReminder() {
    console.log("data " + this.getAttribute("data_time"));
    addButton.style.display = "none";
    editButton.style.display = "inline-block";
    removeButton.style.display = "inline-block";
    dataBox.style.display = "block";
  }

  function longPressStart(event) {
    event.preventDefault();
    //??? no long press if moving
    console.log("start");
    timer = setTimeout(editReminder.bind(this), longPressMs);
  }

  function longPressEnd(event) {
    event.preventDefault();
    if(timer) clearTimeout(timer);
    console.log("  END");
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
    //??? restore, check not much movement
    //reminderElem.ontouchmove = longPressEnd;
  });
}

function addDataEvents(reminders, all) {
  let dataBox = document.getElementById("data-box");
  let plusButton = document.getElementById("plus");
  let addButton = document.getElementById("add");
  let editButton = document.getElementById("edit");
  let removeButton = document.getElementById("remove");
  let cancelButton = document.getElementById("cancel");

  plusButton.onclick = function() {
    addButton.style.display = "inline-block";
    editButton.style.display = "none";
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

  editButton.onclick = function() {
    //??? remove current, create new and add
    console.log("edit");
    dataBox.style.display = "none";
  }

  removeButton.onclick = function() {
    console.log("remove");
    dataBox.style.display = "none";
  }

  cancelButton.onclick = function() {
    dataBox.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", function() {
  addDebug(true);
  fixVerticalHeight();

  const remindersBox = document.getElementById("reminders-box");
  const allReminders= document.getElementById("all-reminders");
  addScrollEvents(remindersBox, allReminders);

  const remindersData = loadLocalRemindersData();
  reminders = remindersData.map(function(data) { return createReminder(data) });
  drawReminders(reminders, allReminders);

  addDataEvents(reminders, allReminders);
});
