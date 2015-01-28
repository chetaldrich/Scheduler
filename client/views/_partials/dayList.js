
Template.dayList.rendered = function() {
  Session.set('editing#' + this._id, false);
};

Template.dayList.helpers({
  date: function() {
    return moment(this.date).calendar(true);
  },

  tasks: function() {
    return this.todos;
  },

  hasTasks: function() {
    return this.todos.length > 0;
  },

  timeRemainingStr: function() {
    return this.timeRemaining.toAbbrevDetailStr();
  },

  editing: function() {
    return Session.get('editing#' + this._id);
  },

  dayListIsToday: function() {
    return this.date.isToday();
  }
});

Template.dayList.events({
  'click .timeRemaining': function(e) {
    Session.set('editing#' + this._id, 'timeRemaining');
    setTimeout(render.bind(this), 300);
  },

  'click .submit': function(e) {
    confirm.call(this);
    Session.set('editing#' + this._id, false);
  }
});

function render() {
  var date = this.date;
  var user = Meteor.user();
  var timeRemaining = user.timeRemaining(date);
  var minutesUnit = 5;
  var hr = timeRemaining.hours;
  var min = Math.ceil(timeRemaining.minutes / minutesUnit) * minutesUnit;

  $(function () {
    $("#datetimepicker").datetimepicker({
      pick12HourFormat: true
    });
  });

  $(function() {
    var taskHours = $('select#task-hours');
    for (var i = 0; i < 24; i++) {
      taskHours.append($("<option/>").val(i).text(i));
    }
    var thing = taskHours.val(hr);
  });

  $(function() {
    var taskMinutes = $('select#task-minutes')
    for (var i = 0; i < 60; i += minutesUnit) {
      taskMinutes.append($("<option/>").val(i).text(i));
    }
    taskMinutes.val(min);
  });
};

function confirm() {
  var hr = $('#task-hours').val();
  var min = $('#task-minutes').val();
  var remaining = ((hr * 60 * 60) + (min * 60)) * 1000;
  var user = Meteor.user();
  var date = this.date;
  user.timeRemaining(date, remaining);
};
