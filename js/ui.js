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

function addReminders(events, wrap) {
  let index = 0;
  events.forEach(function(event) {
    if(wrap.children.length > index) {
      if(event.id != parseInt(wrap.children[index].getAttribute("data_id"))) {
        wrap.appendChild(createReminder(event));
      }
      index++;
    } else {
      wrap.appendChild(createReminder(event));
    }
  });
}
