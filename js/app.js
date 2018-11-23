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

function addDebug(useDebug) {
  const version = 0.31;

  if(useDebug) {
    const versionElem = document.getElementById("version");
    versionElem.innerHTML = "version " + version.toFixed(2);

    const footer = document.querySelector("footer");
    var consoleBox = document.createElement("div");
    consoleBox.setAttribute("id", "console-box");
    footer.appendChild(consoleBox);
    captureConsoleLog(consoleBox);
  }
}


function addVerticalHeightEvents(body) {
  //let main = document.querySelector("main");
  //document.body.height = Math.max(window.innerHeight, document.documentElement.clientHeight);
  //document.body.height = document.documentElement.clientHeight;
  //main.style.height = document.documentElement.clientHeight + "px";

  function setVerticalHeight() {
    const navBar = 56;
    let vh = (window.innerHeight - 56) * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
    console.log("resize  wih" + window.innerHeight.toFixed() + " dch" +  document.documentElement.clientHeight.toFixed() + " 100vh" + (100 * vh).toFixed());
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
  data.push({date: new Date(2018, 11, 1, 9, 30), note: "Scouting for food"});
  data.push({date: new Date(2018, 11, 8, 9, 0), note: "Gingerbread party"});
  data.push({date: new Date(2018, 11, 9, 17, 0), note: "Holiday express"});
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

function drawReminders(reminders, all) {
  const options = {weekday:"short", day:"numeric", month:"short", hour:"numeric", minute:"2-digit"};

  reminders.forEach(function(reminder) {
    var reminderElem = document.createElement("div");
    reminderElem.setAttribute("class", "reminder");
    var dateElem = document.createElement("div");
    dateElem.setAttribute("class", "date");
    dateElem.innerHTML = reminder.date.toLocaleString("en-us", options);
    var noteElem = document.createElement("div");
    noteElem.setAttribute("class", "note");
    noteElem.innerHTML = reminder.note;

    all.appendChild(reminderElem);
    reminderElem.appendChild(dateElem);
    reminderElem.appendChild(noteElem);
  });
}

document.addEventListener("DOMContentLoaded", function() {
  addDebug(true);
  addVerticalHeightEvents();

  const remindersBox = document.getElementById("reminders-box");
  const allReminders= document.getElementById("all-reminders");
  addScrollEvents(remindersBox, allReminders);

  const remindersData = loadLocalRemindersData();
  reminders = remindersData.map(function(data) { return createReminder(data) });
  drawReminders(reminders, allReminders);
});
