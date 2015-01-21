Template.editTask.rendered = function() {

  $(function () {
    $("#datetimepicker").datetimepicker({
      pick12HourFormat: true
    });
  });

  $(function () {
    var taskHours = $('select#task-hours');
    for (var i = 0; i < 101; i++) {
      taskHours.append($("<option/>").val(i).text(i));
    }
    var taskMinutes = $('select#task-minutes')
    for (var i = 0; i < 60; i += 5) {
      taskMinutes.append($("<option/>") .val(i) .text(i));
    }
  });

};

confirmEditTask = function(todoId) {
  // event.preventDefault();
  // validation
  var todo = {};
  if ($("input#title").val() != "") {
    todo.title = $('#title').val();
  }
  if (!($("select#task-hours").val() == 0 && $("select#task-minutes").val() == 0)) {
    todo.remainingLength = ($('#task-hours').val() * 60 * 60) + ($('#task-minutes').val() * 60);
  }
  if ($("#datetimepicker input").val() != "") {
    todo.dueAt = new Date($('#datetimepicker input').val());
  }
  if ($("div#importance-group label.active").length != 0) {
    todo.importance = $("div#importance-group label.active").children("input").eq(0).val();
  }

  updateTodo(todoId, todo, function (err, id) {
    if(err) console.log(err);
    else console.log('id: ', id);
    $('#edit-modal').modal('hide');
  });
};
