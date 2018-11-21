function loadLocalRemindersData() {
  let data = [];
  data.push({date: new Date(2018, 11, 1, 9, 30), note: "Scouting for food"});
  data.push({date: new Date(2018, 11, 8, 9, 0), note: "Gingerbread party"});
  data.push({date: new Date(2018, 11, 9, 17, 0), note: "Holiday express"});
  return data;
}

document.addEventListener("DOMContentLoaded", function() {
  console.log("dom loaded");
  let remindersData = loadLocalRemindersData();
  console.log("remindersData", remindersData);
  reminders = remindersData.map(function(data) { createReminder(data) });
  console.log("reminders", reminders);
});
