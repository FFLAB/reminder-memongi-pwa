function captureConsoleLog(captureElem) {
  let oldConsoleLog = console.log;

  console.log = function(message) {
    captureElem.innerHTML += "<div>" + message + "</div>";
    captureElem.scrollTop = captureElem.scrollHeight;
    oldConsoleLog.apply(console, arguments);
  };
}

function addDebug(useDebug) {
  const version = 0.21;

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
  return data;
}

document.addEventListener("DOMContentLoaded", function() {
  addDebug(true);

  const remindersData = loadLocalRemindersData();
  reminders = remindersData.map(function(data) { return createReminder(data) });
  console.log("reminders l=" + reminders.length);
});
