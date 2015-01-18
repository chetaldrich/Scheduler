
Meteor.users.helpers({
  todos: function() {
    return Todos.find({ ownerId: this._id });
  },

  timeslots: function() {
    // get average free time based on last week
    var lastWeek = Timeslots.find({
      ownerId: this._id,
      date: {
        $gte: Date.sevenDaysAgoStart(),
        $lt: Date.todayStart()
      }
    });

    var avgLength;
    if (!lastWeek[0]) {
      avgLength = 4*60*60;
    } else {
      var total = _.reduce(lastWeek, function(sum, item) {
        return sum + item.inputLength;
      });
      avgLength = total / lastWeek.length;
    };

    // get all the todos from today until infinity, sorted by date
    var todos = Todos.find({ ownerId: this._id, dueAt: { $gte: Date.todayStart() } },
                           {
                             sort: [[ 'dueAt', 'asc' ]]
                           }).fetch();

    // create all the timeslots from today until the furthest due date, sorted by date
    var todaysTimeslot = Timeslots.find({ ownerId: this._id, date: new Date(Date.todayStart()) }).fetch()[0];
    if(!todaysTimeslot) {
      todaysTimeslot = { ownerId: this._id, date: new Date(Date.todayStart()), inputLength: avgLength, actualLength: 0 };
      Timeslots.insert(todaysTimeslot);
    }
    var timeslots = [ todaysTimeslot ];
    var startDate = new Date(Date.todayStart());
    if (!_.last(todos)) return timeslots;
    else var endDate = _.last(todos).dueAt;

    for(var d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
      timeslots.push({
        ownerId: this._id,
        date: d,
        inputLength: avgLength
      });
    }

    return timeslots;
  }, // end of user.timeslots()

  updateTimeslot: function(timeToAdd) {
    console.log(timeToAdd);
    console.log("TYPE" + parseInt(timeToAdd));
    var id = Timeslots.findOne({ ownerId: this._id, date: new Date(Date.todayStart()) })._id;
    console.log("ACTUAL BEFORE: " + Timeslots.findOne({ ownerId: this._id, date: new Date(Date.todayStart()) }).actualLength)
    Timeslots.update(id, {$inc: { actualLength: parseInt(timeToAdd) }});
    console.log("ACTUAL: " + Timeslots.findOne({ ownerId: this._id, date: new Date(Date.todayStart()) }).actualLength)

  },

  freeTime: function() {
    var timeslot = Timeslots.findOne({ ownerId: this._id, date: new Date(Date.todayStart()) });
    return secToTime(timeslot.inputLength - timeslot.actualLength);
  },

  changeFreeTime: function(newTime) {
    var id = Timeslots.findOne({ ownerId: this._id, date: new Date(Date.todayStart()) })._id;
    Timeslots.update(id, { $set: { inputLength: newTime } });
  },

  tasksByDay: function() {
    console.log(userTodos(Meteor.user()));
    // return userTodos(Meteor.user());
    // return userFillDays(Meteor.user());
    return [
      [
        new Date(), [
          {
            title: 'task 1',
            dueAt: new Date(),
            isDone: false,
            importance: "!!",
            completedLength: 100,
            inputLength: 3600,
            // percentDone: Math.round((100/3600)*100)
          },
          {
            title: 'task 2',
            dueAt: new Date(),
            isDone: false,
            importance: "!!!",
            completedLength: 1000,
            inputLength: 1800,
            // percentDone: Math.round((1000/1800)*100)
          },
          {
            title: 'task 3',
            dueAt: new Date(),
            isDone: true,
            importance: "!",
            completedLength: 0,
            inputLength: 4800,
            // percentDone: Math.round((0/4800)*100)
          }
        ],
        3
      ]
    ];
  }
});
