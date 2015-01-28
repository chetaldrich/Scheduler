
/*
 * Task
 * ====
 * ownerId       : String
 * title         : String
 * isDone        : Bool
 * dueAt         : Date
 * importance    : Integer<1,2,3>
 * timeSpent     : Duration
 * timeRemaining : Duration
 *
 */

Tasks = new Mongo.Collection("tasks");

Tasks.before.insert(function(userId, doc) {
  doc.createdAt = new Date();
  doc = fieldsToMilliseconds(doc);
  //TODO: if(typeof doc.date === 'date') doc.date = Day.fromDate(doc.date);
  return doc;
});

Tasks.helpers({

  owner: function() {
    return Meteor.users.findOne(this.ownerId);
  },

  // returns totalTime
  totalTime: function() {
    var remaining = this.timeRemaining.toMilliseconds();
    var spent     = this.timeSpent.toMilliseconds();
    return new Duration(remaining + spent);
  },

  spendTime: function(milliseconds) {
    this.incrementTimeSpent(milliseconds);
    this.incrementTimeRemaining(- milliseconds);
    this.owner().spendTime(milliseconds);
  },

  incrementTimeRemaining: function(milliseconds) {
    Tasks.update(this._id, { $inc: { timeRemaining: milliseconds }});
    var current = this.timeRemaining.toMilliseconds();
    return new Duration(current + milliseconds);
  },

  incrementTimeSpent: function(milliseconds) {
    Tasks.update(this._id, { $inc: { timeSpent: milliseconds }});
    var current = this.timeSpent.toMilliseconds();
    return new Duration(current + milliseconds);
  },

  // returns percentage between 0 and 100
  percentageCompleted: function() {
    var spent = this.timeSpent.toMilliseconds();;
    var total = this.totalTime().toMilliseconds();
    console.log('spent: ', spent);
    console.log('total: ', total);
    return Math.floor(spent / total * 100);
  },

  dueAtDisplay: function() {
    var today = Date.now();
    return moment(this.dueAt).from(today);
  },

  timeRemainingStr: function() {
    return this.timeRemaining.toAbbrevDetailStr();
  },

  markDone: function(done) {
    if(done === undefined) done = true;
    Tasks.update(this._id, { $set: { isDone: done } });
  },

  // input:  duration of first task in output
  // output: pair of tasks
  split: function(duration) {
    if(duration.toMilliseconds() > this.timeRemaining.toMilliseconds()) {
      console.log('task split error: duration exceeds timeRemaining');
      return [ null, R.cloneDeep(this) ];
    }

    var firstTask = R.cloneDeep(this);
    firstTask.timeRemaining = new Duration(duration);

    var secondTask = R.cloneDeep(this);
    var remaining  = this.timeRemaining.toMilliseconds() - duration.toMilliseconds();
    secondTask.timeRemaining =  new Duration(remaining);

    // TODO: set timeSpent also

    return [ firstTask, secondTask ];
  }

});

insertTask = function (task, callback) {
  task.createdAt     = new Date();
	task.title         = task.title         || "New task";
	task.isDone        = task.isDone        || false;
	task.dueAt         = task.dueAt         || Date.todayEnd();
	task.importance    = task.importance    || 3;
	task.timeSpent     = task.timeSpent     || new Duration(0);
	task.timeRemaining = task.timeRemaining || fromSeconds(30 * 60);
  task.ownerId       = task.ownerId       || Meteor.userId();
  task = fieldsToMilliseconds(task);
  console.log('task: ', task);
	return Tasks.insert(task, callback);
};

updateTask = function(_id, modifier, callback) {
  var keys = _.keys(modifier);
  if(!_.some(keys, isFirstChar('$'))) modifier = { $set: modifier };
  if(!modifier.$set) modifier.$set = { updatedAt: new Date() };
  else modifier.$set.updatedAt = new Date();
  Tasks.update(_id, modifier, callback);
};

fetchTasks = function(selector, options) {
  var ary = Tasks.find(selector, options).fetch();
  console.log('ary: ', ary);
  return lodash.map(ary, fieldsToDuration);
};

findOneTask = function(selector) {
  var item = Tasks.findOne(selector);
  item     = fieldsToDuration(item);
  return item;
};

findTask = function(id) {
  return Tasks.findOne({ _id: id});
}

findTasks = function(ids) {
  if(!ids) return;
  return Tasks.find({ _id: { $in: ids } });
};

tasksByIndex = function(selector) {
  if(!selector) selector = {};
  return Tasks.find(selector, { sort: [[ 'index', 'asc' ]] });
};
