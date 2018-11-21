function loadLocalRemindersData() {
  let reminders = [];
  reminders.push(createReminder({date: new Date(2018, 11, 1, 9, 30), note: "Scouting for food"}));
  reminders.push(createReminder({date: new Date(2018, 11, 8, 9, 0), note: "Gingerbread party"}));
  reminders.push(createReminder({date: new Date(2018, 11, 9, 17, 0), note: "Holiday express"}));
  return reminders;
}

document.addEventListener("DOMContentLoaded", function() {
  console.log("dom loaded");
  let reminders = loadLocalRemindersData();
  console.log("reminders", reminders);
});
