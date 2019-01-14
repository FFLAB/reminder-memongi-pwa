function addUpdateEvent(updateButton) {
  updateButton.onclick = function() {
    const cacheName = "reminder-cache";
    if(navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage("update-cache");
      } else {
        console.log("could not send message: no service worker");
      }
  };
}

function getEditUi() {
  return {
    box: document.getElementById("edit-box"),
    save: document.getElementById("edit-save"),
    remove: document.getElementById("edit-remove"),
    cancel: document.getElementById("edit-cancel"),
    year: document.getElementById("year"),
    month: document.getElementById("month"),
    day: document.getElementById("day"),
    hours: document.getElementById("hours"),
    minutes: document.getElementById("minutes"),
    am: document.getElementById("am"),
    pm: document.getElementById("pm"),
    duration: document.getElementById("duration"),
    note: document.getElementById("note"),
    id: -1
  };
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
  ui.id = -1
  return ui;
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
  return [date.getTime(), ui.note.value];
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

function addPlusEvent(plusButton, editUi) {
  plusButton.onclick = function() {
    //??? change to writeEditUi with 1 week in the future
    const now = new Date();
    editUi = clearEditUi(editUi);
    editUi.box.setAttribute("data_id", -1);
    editUi.remove.style.display = "none";
    editUi.year.value = now.getFullYear();
    editUi.month.value = now.getMonth() + 1;
    editUi.day.value = now.getDate();
    editUi.box.style.display = "block";
  };
}

function addEditEvents(ui, events, wrap) {
  ui.save.onclick = function() {
    ui.box.style.display = "none";
    if(ui.id >= 0) {
      events.remove(ui.id);
    }
    events.add(...readEditUi(ui));
    updateReminders(events.all(), wrap);
    events.save();
  };

  ui.remove.onclick = function() {
    ui.box.style.display = "none";
    if(ui.id >= 0) {
      events.remove(ui.id);
    }
    updateReminders(events.all(), wrap);
    events.save();
  };

  ui.cancel.onclick = function() {
    ui.box.style.display = "none";
  };
}

function addScrollEvents(outer, inner) {
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
      const yOffsetMin = outer.clientHeight - outer.scrollHeight;
      if((yOffsetMin > 0) || (yOffset > 0)) {
        yOffset = 0;
      } else if (yOffset < yOffsetMin) {
        yOffset = yOffsetMin;
      }
      inner.style.top = yOffset + "px";
    }
  }

  inner.ontouchstart = function(event) {
    event.preventDefault();
    enableScroll(true, event.touches[0] && event.touches[0].clientY);
  };

  inner.ontouchmove = function(event) {
    event.preventDefault();
    moveScroll(event.touches[0] && event.touches[0].clientY);
  };

  inner.ontouchend = function(event) {
    event.preventDefault();
    enableScroll(false);
  };

  inner.onmousedown = function(event) {
    event.preventDefault();
    enableScroll(true, event.clientY);
  };

  inner.onmouseup = function(event) {
    event.preventDefault();
    enableScroll(false);
  };

  inner.onmouseleave = function(event) {
    event.preventDefault();
    enableScroll(false);
  };

  inner.onmousemove = function(event) {
    event.preventDefault();
    moveScroll(event.clientY);
  };
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

function createReminder(event) {
  const now = new Date();
  const options0 = {weekday:"short", day:"numeric", month:"short", year:"numeric"};
  const date = new Date(event.time);

  const options1 = {hour:"numeric", minute:"2-digit"};
  var ui = document.createElement("div");
  ui.classList.add("reminder");
  ui.classList.add(untilClass(now, date));
  ui.setAttribute("data_id", event.id);
  ui.setAttribute("data_time", event.time);
  var untilElem = document.createElement("div");
  untilElem.setAttribute("class", "until");
  untilElem.innerHTML = untilText(now, date);
  var dateElem = document.createElement("div");
  dateElem.setAttribute("class", "date");
  let dateSpan0 = document.createElement("span");
  dateSpan0.innerHTML = date.toLocaleString("en-us", options0);
  let dateSpan1 = document.createElement("span");
  dateSpan1.innerHTML = date.toLocaleString("en-us", options1);
  dateElem.innerHTML = dateSpan0.outerHTML + dateSpan1.outerHTML;
  var noteElem = document.createElement("div");
  noteElem.setAttribute("class", "note");
  noteElem.innerHTML = event.note;

  ui.appendChild(untilElem);
  ui.appendChild(dateElem);
  ui.appendChild(noteElem);
  return ui;
}

function updateReminders(events, wrap) {
  while(wrap.firstChild) {
    wrap.removeChild(wrap.firstChild);
  }
  events.forEach((event) => {
    wrap.appendChild(createReminder(event));
  });
}
