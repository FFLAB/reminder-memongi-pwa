function createReminderFactory() {
  console.log("createReminderFactory");
}

function reminderByDate(a, b) {
  return a.date.getTime() - b.date.getTime();
}

let reminderNextId = 0;
let reminderPrototype = Object.create(Object.prototype);

reminderPrototype.toData = function() {
  return JSON.stringify(this);
}

function createReminder(data) {
  let reminder = Object.create(reminderPrototype)
  reminder.date = new Date(data.date);
  reminder.note = data.note;
  reminder.id = reminderNextId++; 

  return reminder;
}
