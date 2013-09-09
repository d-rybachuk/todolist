//Load new project
function new_project(id,task,data) {
  $('<tr id="'+id+'" class="project">')
  .append (
    $('<div class="panel panel-primary">')
    .append (
      $('<div class="panel-heading">')
      .append (
        $('<table class="table table-condensed project-header">')
        .append (
          $('<td class="text-left calendar"><span class="glyphicon glyphicon-calendar glyphicon-hidden"></span>')
        )
        .append (
          $('<td class="panel-title text-left"><p id="task_name">'+task+'</p><input id="get_data" type="hidden" value="'+data+'">')
        )
        .append (
          $('<td class="text-right utils"><span class="glyphicon glyphicon-pencil glyphicon-hidden">&nbsp;|&nbsp;</span><span class="glyphicon glyphicon-trash glyphicon-hidden"></span>')
        )
      )
    )
    .append (
      $('<form class="form-inline" role="form" style="width: 100%"><div class="input-group"><span class="input-group-addon"><span class="glyphicon glyphicon-plus"></span></span><input id="newtask_name" type="text" placeholder="Start typing here to create a task..." class="form-control"><span class="input-group-btn"><button id="add_task" class="btn btn-success utils" type="button">AddTask</button></span></div></form>')
    )
    .append (
      $('<table id="tasks'+id+'" class="table table-bordered tasks">')
    )
  )
  .appendTo('.projects');
}
//Load new task
function new_task(parent_id,id,task,checkbox) {
  if(checkbox ==1){
    var checked="checked";
  }else{
    var checked="";
  }
  $('<tr id="task_'+id+'" class="task">')
  .append (
    $('<td class="task-checkbox"><input type="checkbox" '+checked+'>')
  )
  .append (
    $('<td class="text-left"><p id="task_name">'+task+'</p>')
  )
  .append (
    $('<td class="text-right utils"><span class="glyphicon glyphicon-resize-vertical glyphicon-hidden">&nbsp;|&nbsp;</span><span class="glyphicon glyphicon-pencil glyphicon-hidden">&nbsp;|&nbsp;</span><span class="glyphicon glyphicon-trash glyphicon-hidden"></span>')
  )
  .appendTo('#tasks'+parent_id)
}
//first init after auth
function init_tasks(user_id) {
    $.getJSON("ajax.php", { user_id: user_id, key: '1'})
        .done(function(data){
                $.each(data, function (id,value) {
                new_project(value.id, value.task, value.data);
                if (value.subtask){
                  var subtask =value.subtask;
                  $.each(subtask, function (id,sub_value) {
                    new_task(value.id,sub_value.id, sub_value.task, sub_value.checkbox);
                  });
                }
               });
        });
}
//Add new project
function add_project(user_id,task) {
    $.getJSON("ajax.php", { user_id: user_id, task: task, key: '2'})
        .done(function(data){
                  $.each(data, function (id,value) {
                    new_project(value.id, value.task);
                  });
        });
}
//Add new task
function add_task(user_id,parent_id,task) {
    $.getJSON("ajax.php", { user_id: user_id, parent_id: parent_id, task: task, key: '3'})
        .done(function(data){
                $.each(data, function (id,value) {
                  if (value.subtask){
                    var subtask =value.subtask;
                    $.each(subtask, function (id,sub_value) {
                      new_task(value.id,sub_value.id, sub_value.task);
                    });
                  }
               })
        });
}
//Delete task
function del_task(user_id,task_id, parent_id) {
    $.getJSON("ajax.php", { user_id: user_id, task_id: match(task_id) , parent_id: parent_id, key: '4'});
}
//Edit task name
function edit_task(user_id,task_id, parent_id,task) {
    $.getJSON("ajax.php", { user_id: user_id, task_id: match(task_id), parent_id: parent_id, task: task, key: '5'});
}
//Sorting tasks
function sorted(user_id,order,task_id,parent_id) {
    $.getJSON("ajax.php", { user_id: user_id, order: order, task_id: match(task_id), parent_id: parent_id, key: '6'});
}
//Change check box
function check_box(user_id,checkbox,task_id,parent_id) {
    $.getJSON("ajax.php", { user_id: user_id, checkbox: checkbox, task_id: match(task_id), parent_id: parent_id, key: '7'});
}
//Set date of project
function change_data(user_id,data,task_id) {
    $.getJSON("ajax.php", { user_id: user_id, data: data, task_id: match(task_id), key: '8'});
}
//Get date of project
function get_data(user_id,task_id) {
    $.getJSON("ajax.php", { user_id: user_id, task_id: match(task_id), key: '9'})
        .done(function(data){
           $('#'+task_id+'').find('#get_data').val(''+data+'');
        });
}
function match(task_id) {
    var re =  /([0-9]+)/g;
    var task_id = task_id.match(re);
    return task_id[0];
}
//Show todo-list for authorized users
function html_login(user) {
    $('.todo-list').html('<div class="page-header" ><h1>SIMPLE TODO LIST</h1></div><h4><p>From Ruby Garage</p></h4><table class="projects"></table><div class="input-group"><button id="add_project"  class="btn btn-primary btn-md" type="button"><span class="glyphicon glyphicon-plus"></span> Add TODO list</a></div>');
    $('.navbar-form').html('<button type="button" class="btn btn btn-primary" disabled="disabled">Login as:'+user+'</button><button id="logout" class="btn btn-success" type="button">Logout</button>');
}
//Hide  todo-list and show form for authorise
function html_nologin() {
    $('.navbar-form').html('<form class="navbar-form navbar-right"><div class="form-group"><input id="user" type="text" placeholder="User" class="form-control"></div><div class="form-group"><input id="pass" type="password" placeholder="Password" class="form-control"></div><button id="auth" type="button" class="btn btn-success">Sign in</button></form>');
    $('.todo-list').html('');
}

$(document).ready(function(){
  if(sessionStorage.getItem('user_id')){
    html_login(sessionStorage.getItem('user'));
    init_tasks(sessionStorage.getItem('user_id'));
  }else{
   html_nologin();
  }
//Auth block
  $(document.body).on('click','#auth', function (){
    var user = $('#user').val();
    var pass = $('#pass').val();
    $.post("auth.php", { user: user, pass: pass})
        .done(function(data){
                  if(data) {
                     sessionStorage.setItem('user', user);
                     sessionStorage.setItem('user_id', data);
                     html_login(sessionStorage.getItem('user'));
                     init_tasks(sessionStorage.getItem('user_id'));
                  }else{
                     apprise('Username or password are incorrect, please contact your administrator!')
                  }
        });
  });
//Logout block
  $(document.body).on('click','#logout', function (){
    apprise('Are you sure you want to logout?',{'verify':true, 'textYes':'Yes', 'textNo':'No'}, function(data) {
      if(data){
       sessionStorage.removeItem('user');
       sessionStorage.removeItem('user_id');
       sessionStorage.removeItem('pass');
       html_nologin();
       }
    });
  });
//Add new project
  $(document.body).on('click','#add_project', function (){
    apprise('Enter task name:', {'input':true}, function(project) {
        if (project) {
          add_project(sessionStorage.getItem('user_id'),project);
        }else{
          apprise('Field is empty!!! Please make correct input.');
        }
      });
  });
//Make sorting
  $(document.body).on('mouseenter','.glyphicon-resize-vertical', function (){
    $(this).parents('tbody').sortable({
      'update': function (event, ui) {
          var order = $(this).sortable('serialize');
          var id = $(this).parents('tr:first').attr('id');
          var parent_id = $(this).parents('tr:first').parents('tr:first').attr('id');
        sorted(sessionStorage.getItem('user_id'),order,id,parent_id);
      }
    });
    $(this).parents('tbody').disableSelection();
  });
//Checkbox task
  $(document.body).on('click',':checkbox', function (){
    var id = $(this).parents('tr:first').attr('id');
    var parent_id = $(this).parents('tr:first').parents('tr:first').attr('id');
      if($(this).is(':checked')){
        var stat=1;
        $(this).prop("checked", true);
      }else{
        var stat=0;
        $(this).prop("checked", false);
      }
    check_box(sessionStorage.getItem('user_id'),stat,id,parent_id);
  });
//Create new task
  $(document.body).on('click','#add_task', function (){
    var id = $(this).parents('tr:first').attr('id');
    var taskname = $(this).parents('tr:first').find('#newtask_name').val();
    if (taskname){
      add_task(sessionStorage.getItem('user_id'),id,taskname);
      $(this).parents('tr:first').find('#newtask_name').val('');
    }else{
      apprise('Field is empty!!! Please make correct input.')
    }
  });
//Make  task name and project name editable
  $(document.body).on('click','.glyphicon-pencil', function (){
    var data = $(this).parents('tr:first').find('p').first().text();
    $(this).parents('tr:first').find('.datepicker').replaceWith('<span class="glyphicon glyphicon-calendar"></span>');
    $(this).parents('tr:first').find('#task_name').first()
    .replaceWith('<form class="form-inline" role="form"><div class="input-group input-group-sm newtask_name"><input id="edit_task_name" type="text" value="'+data+'" placeholder="Start typing here to create a task..." class="form-control"><span class="input-group-btn"><button id="edit_task" class="btn btn-primary" type="button">Edit</button></span></div></div>');
    $(this).parents('tr:first').find('.glyphicon-pencil').first().replaceWith('<span id="hide_pen"></span>');
  });
//Edit task name and project name
  $(document.body).on('click','#edit_task', function (){
    var id = $(this).parents('tr:first').attr('id');
    var parent_id = $(this).parents('tr:first').parents('tr:first').attr('id');
    var newtaskname = $(this).parents('tr:first').find('#edit_task_name').first().val();
    if (newtaskname == ""){
      apprise('Field is empty!!! Please make correct input.')
    }else{
      $(this).parents('tr:first').find('#hide_pen').replaceWith('<span class="glyphicon glyphicon-pencil">&nbsp;|&nbsp;</span>');
      $(this).parents('tr:first').find('.newtask_name').first().replaceWith('<p id="task_name">'+newtaskname+'</p>');
      edit_task(sessionStorage.getItem('user_id'),id,parent_id,newtaskname);
    }
  });
//Run datapicker
  $(document.body).on('click','.glyphicon-calendar', function (){
    var id = $(this).parents('tr:first').attr('id');
    var data = $(this).parents('tr:first').find('#get_data').first().val();
    var newtaskname = $(this).parents('tr:first').find('#edit_task_name').first().val();
    $(this).parents('tr:first').find('#hide_pen').replaceWith('<span class="glyphicon glyphicon-pencil">&nbsp;|&nbsp;</span>');
    $(this).parents('tr:first').find('.newtask_name').first().replaceWith('<p id="task_name">'+newtaskname+'</p>');
    $(this).parents('tr:first').find('.glyphicon-calendar')
    .replaceWith('<div class="input-group input-group-sm datepicker"><input id="datapicker" value="'+data+'" type="text" class="form-control"><span class="input-group-btn"><button  id="hide_date" class="btn btn-primary"><</span></button></span></div>');
    $('#datapicker').datepicker({ autoSize: true ,
      dateFormat: "yy-mm-dd ",
      onSelect: function(data) {
       change_data(sessionStorage.getItem('user_id'),data,id);
       get_data(sessionStorage.getItem('user_id'),id);
      }
    });
  });
//Hide date
  $(document.body).on('click','#hide_date', function (){
     $(this).parents('tr:first').find('.datepicker')
     .replaceWith('<span class="glyphicon glyphicon-calendar"></span>');

  });
//Delete project or task
  $(document.body).on('click','.glyphicon-trash', function (){
    var id = $(this).parents('tr:first').attr('id');
    var parent_id = $(this).parents('tr:first').parents('tr:first').attr('id');
        del_task(sessionStorage.getItem('user_id'),id,parent_id);
        $(this).parents('tr:first').remove();
  });
//make adition tools visible on projects
  $(document.body).on('mouseenter','.panel-heading', function(){
    $(this).find('.glyphicon').removeClass("glyphicon-hidden").addClass("glyphicon-visible");
  }).on('mouseleave', '.panel-heading', function() {
    $(this).find('.glyphicon').removeClass("glyphicon-visible").addClass("glyphicon-hidden");
  });
//make adition tools visible on tasks
  $(document.body).on('mouseenter','.task', function(){
    $(this).find('.glyphicon').removeClass("glyphicon-hidden").addClass("glyphicon-visible");
    $(this).addClass("highlight-on");
  }).on('mouseleave', '.task', function() {
    $(this).find('.glyphicon').removeClass("glyphicon-visible").addClass("glyphicon-hidden");
    $(this).removeClass("highlight-on");
  });
//
  $(document.body).on('click','.navbar-toggle', function(){
    $(this).parents('.navbar-collapse:first').addClass("in");
  });
});

