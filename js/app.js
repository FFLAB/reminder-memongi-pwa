function captureConsoleLog(captureElem) {
  let oldConsoleLog = console.log;

  console.log = function(message) {
    captureElem.innerHTML += "<div>" + message + "</div>";
    captureElem.scrollTop = captureElem.scrollHeight;
    oldConsoleLog.apply(console, arguments);
  };
}

function addDebug(useDebug) {
  const version = 0.24;

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

function loadLocalRemindersData() {
  let data = [];
  data.push({date: new Date(2018, 11, 1, 9, 30), note: "Scouting for food"});
  data.push({date: new Date(2018, 11, 8, 9, 0), note: "Gingerbread party"});
  data.push({date: new Date(2018, 11, 9, 17, 0), note: "Holiday express"});
  data.push({date: new Date(2018, 11, 1, 9, 30), note: "Scouting for food"});
  data.push({date: new Date(2018, 11, 8, 9, 0), note: "Gingerbread party"});
  data.push({date: new Date(2018, 11, 9, 17, 0), note: "Holiday express"});
  return data;
}

function drawReminders(reminders, box) {
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

    box.appendChild(reminderElem);
    reminderElem.appendChild(dateElem);
    reminderElem.appendChild(noteElem);
  });
}

document.addEventListener("DOMContentLoaded", function() {
  addDebug(true);

  const remindersData = loadLocalRemindersData();
  reminders = remindersData.map(function(data) { return createReminder(data) });
  const remindersBox = document.getElementById("reminders-box");
  drawReminders(reminders, remindersBox);
  console.log("reminders", reminders);
});

/*
  events.ontouchstart = function(event) {
    event.preventDefault();
    var touch = event.touches[0];
    lastY = touch.pageY;
    isDown = true;
  }

  events.ontouchend = function(event) {
    event.preventDefault();
    isDown = false;
  }

  events.ontouchmove = function(event) {
    event.preventDefault();
    if(isDown) {
      var touch = event.touches[0];
      let diff = touch.pageY - lastY;
      lastY = touch.pageY;
      offsetY += diff;

      const offsetMin = eventsBox.clientHeight - events.clientHeight;
      if((offsetMin > 0) || (offsetY > 0)) {
        offsetY = 0;
      } else if (offsetY < offsetMin) {
        offsetY = offsetMin;
      }
      events.style.top = offsetY + "px";
    }
  }
});
 */
