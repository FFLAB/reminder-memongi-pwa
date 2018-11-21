function createReminderFactory() {
  console.log("createReminderFactory");
}

var reminderPrototype = Object.create(Object.prototype);
reminderPrototype.doStuff = function() {
  console.log("stuff note=" + this.note)
}

function createReminder(data) {
  let reminder = Object.create(reminderPrototype)
  reminder.date = data.date;
  reminder.note = data.note;

  return reminder;
}
