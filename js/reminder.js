console.log("reminder");
function createReminderFactory() {
  console.log("createReminderFactory");
}

var reminderPrototype = Object.create(Object.prototype);
reminderPrototype.doStuff = function() {
  console.log("stuff")
}

function createReminder(data) {
  let reminder = Object.create(reminderPrototype)
  reminder.date = data.date;
  reminder.note = data.note;

  console.log("createReminder", reminder);
  return reminder;
}
