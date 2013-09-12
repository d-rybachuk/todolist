//Start page
$(document).ready(function(){
  if(sessionStorage.getItem('user_id')){
    html_login(sessionStorage.getItem('user'));
    init_tasks(sessionStorage.getItem('user_id'));
  }else{
   html_nologin();
  }
//Auth block
  $(document.body).on('click','#auth', function (){
    auth();
  });
//Logout block
  $(document.body).on('click','#logout', function (){
    logout();
  });
//Add new project
  $(document.body).on('click','#add_project', function (){
    add_project();
  });
//Create new task
  $(document.body).on('click','#add_task', function (){
    add_task($(this));
  });
//Edit task name and project name
  $(document.body).on('click','#edit_task', function (){
      edit_task($(this));
  });
//Delete project or task
  $(document.body).on('click','.glyphicon-trash', function (){
    del_task($(this));
  });
//Make sorting
  $(document.body).on('mouseenter','.glyphicon-resize-vertical', function (){
    $(this).parents('tbody').sortable({
      'update': function (event, ui) {
          var order = $(this).sortable('serialize');
          var id = $(this).parents('tr:first').attr('id');
          var parent_id = $(this).parents('tr:first').parents('tr:first').attr('id');
        sorted(order,id,parent_id);
      }
    });
    $(this).parents('tbody').disableSelection();
  });
//Checkbox task
  $(document.body).on('click',':checkbox', function (){
    check_box($(this));
  });
//Make  task name and project name editable
  $(document.body).on('click','.glyphicon-pencil', function (){
    var task_name = $(this).parents('tr:first').find('.task_name').first().text();
    $(this).parents('tr:first').find('.project-datepicker').replaceWith('<div class="project-calendar text-left"><span class="glyphicon glyphicon-calendar"></span></div>');
    $(this).parents('tr:first').find('.task_name').first()
    .replaceWith('<form class="form-inline" role="form"><div class="input-group input-group-sm newtask_name"><input id="edit_task_name" type="text" value="'+task_name+'" placeholder="Start typing here to create a task..." class="form-control"><span class="input-group-btn"><button id="edit_task" class="btn btn-primary" type="button">Edit</button></span></div></div>');
    $(this).parents('tr:first').find('.glyphicon-pencil').first().replaceWith('<span id="hide_pen"></span>');
  });
//Run datapicker
  $(document.body).on('click','.glyphicon-calendar', function (){
    $('.project-datepicker').each(function(){
       $('.project-datepicker').replaceWith('<div class="project-calendar text-left"><span class="glyphicon glyphicon-calendar"></span></div>');
    })
    var data = $(this).parents('tr:first').find('.project-date p').text();
    var newtaskname = $(this).parents('tr:first').find('#edit_task_name').first().val();
    $(this).parents('tr:first').find('#hide_pen').replaceWith('<span class="glyphicon glyphicon-pencil">&nbsp;|&nbsp;</span>');
    $(this).parents('tr:first').find('.newtask_name').first().replaceWith('<p id="task_name">'+newtaskname+'</p>');
    $(this).parents('tr:first').find('.project-calendar')
    .replaceWith('<div class="project-datepicker text-left"><div class="input-group input-group-sm"><input id="datapicker" value="'+data+'" type="text" class="form-control"><span class="input-group-btn"><button  id="hide_date" class="btn btn-primary"><</span></button></span></div></div>');
  });
$(document.body).on('focus',"#datapicker", function(){
    var id = $(this).parents('tr:first').attr('id');
    $(this).parents('tr:first').find('#datapicker').datepicker({ 
      autoSize: true ,
      dateFormat: "yy-mm-dd ",
      onSelect: function(data) {
       change_data(data,id);
       $(this).parents('tr:first').find('.project-date p').text(data);
      }
    });
});
//Hide date
  $(document.body).on('click','#hide_date', function (){
    var data = $(this).parents('tr:first').find('#datapicker').val(); 
    $(this).parents('tr:first').find('#get_data').first().val(data);
    $(this).parents('tr:first').find('.project-datepicker')
     .replaceWith('<div class="project-calendar text-left"><span class="glyphicon glyphicon-calendar"></span></div>');

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

//Authorise
function auth() {
    var user = $('#user').val();
    var pass = $('#pass').val();
    $.post("ajax.php", { user: user, pass: pass, key: '0'})
        .done(function(data){
                  if(data) {
                     sessionStorage.setItem('user', user);
                     sessionStorage.setItem('user_id', data);
                     html_login(sessionStorage.getItem('user'));
                     init_tasks();
                  }else{
                     apprise('Username or password are incorrect, please contact your administrator!')
                  }
        });
}
//Load new project
function new_project(id,task,data) {
  $('<tr id="'+id+'" class="project">')
  .append (
    $('<div class="panel panel-primary">')
    .append (
      $('<div class="panel-heading">')
      .append (
        $('<div class="project-header">')
        .append (
          $('<div class="project-date"><p>'+data+'</p>') 
        )
        .append (
          $('<div class="project-calendar text-left"><span class="glyphicon glyphicon-calendar glyphicon-hidden"></span>')
        )
        .append ( 
          $('<div class="project-title text-left"><p class="task_name">'+task+'</p>')
        )
        .append (
          $('<div class="project-utils text-right"><span class="glyphicon glyphicon-pencil glyphicon-hidden">&nbsp;|&nbsp;</span><span class="glyphicon glyphicon-trash glyphicon-hidden"></span>')
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
  $('<tr id="task_'+id+'" class="task">')
  .append (
    $('<td class="task-checkbox"><input type="checkbox" '+checkbox+'>')
  )
  .append (
    $('<td class="text-left"><p class="task_name">'+task+'</p>')
  )
  .append (
    $('<td class="text-right utils"><span class="glyphicon glyphicon-resize-vertical glyphicon-hidden">&nbsp;|&nbsp;</span><span class="glyphicon glyphicon-pencil glyphicon-hidden">&nbsp;|&nbsp;</span><span class="glyphicon glyphicon-trash glyphicon-hidden"></span>')
  )
  .appendTo('#tasks'+parent_id)
}
//first init after auth
function init_tasks() {
    $.post("ajax.php", { user_id: sessionStorage.getItem('user_id'), key: '1'})
        .done(function(data){
                var data = JSON.parse(data);
                $.each(data, function (id,value) {
                new_project(value.id, value.task, value.data);
                if (value.subtask){
                  var subtask =value.subtask;
                  $.each(subtask, function (id,sub_value) {
                    var checked = (sub_value.checkbox == 1)? "checked":""
                    new_task(value.id,sub_value.id, sub_value.task,checked);
                  });
                }
               });
        });
}
//Add new project
function add_project() {
    apprise('Enter task name:', {'input':true}, function(task) {
        if (task) {
           $.post("ajax.php", { user_id: sessionStorage.getItem('user_id'), task: task, key: '2'})
            .done(function(data){
                  var data = JSON.parse(data);
                  $.each(data, function (id,value) {
                    new_project(value.id, value.task);
                  });
            });
        }else{
          apprise('Field is empty!!! Please make correct input.');
        }
      });
}
//Add new task
function add_task(link) {
    var parent_id = link.parents('tr:first').attr('id');
    var task = link.parents('tr:first').find('#newtask_name').val();
    if (task){
    $.post("ajax.php", { user_id: sessionStorage.getItem('user_id'), parent_id: parent_id, task: task, key: '3'})
        .done(function(data){
                var data = JSON.parse(data);
                $.each(data, function (id,value) {
                  if (value.subtask){
                    var subtask =value.subtask;
                    $.each(subtask, function (id,sub_value) {
                      new_task(value.id,sub_value.id, sub_value.task);
                    });
                  }
               })
               link.parents('tr:first').find('#newtask_name').val('');
        });
    }else{
      apprise('Field is empty!!! Please make correct input.')
    }
}
//Delete task
function del_task(link) {
    var task_id = match(link.parents('tr:first').attr('id'));
    var parent_id = link.parents('tr:first').parents('tr:first').attr('id');
    apprise('Are you sure you want to remove item?',{'verify':true, 'textYes':'Yes', 'textNo':'No'}, function(data) {
      if(data){
             $.post("ajax.php", { user_id: sessionStorage.getItem('user_id'), task_id: task_id , parent_id: parent_id, key: '4'});
             link.parents('tr:first').remove();
      }
    });
}
//Edit task name
function edit_task(link) {
    var task_id = match(link.parents('tr:first').attr('id'));
    var parent_id = link.parents('tr:first').parents('tr:first').attr('id');
    var task = link.parents('tr:first').find('#edit_task_name').first().val();
    if (task == ""){
      apprise('Field is empty!!! Please make correct input.')
    }else{
      link.parents('tr:first').find('#hide_pen').replaceWith('<span class="glyphicon glyphicon-pencil">&nbsp;|&nbsp;</span>');
      link.parents('tr:first').find('.project-datepicker').replaceWith('<div class="project-calendar text-left"><span class="glyphicon glyphicon-calendar"></span></div>');
      link.parents('tr:first').find('.newtask_name').first().replaceWith('<p id="task_name">'+task+'</p>');
      $.post("ajax.php", { user_id: sessionStorage.getItem('user_id'), task_id: task_id, parent_id: parent_id, task: task, key: '5'});
    }
}
//Sorting tasks
function sorted(order,task_id,parent_id) {
    $.post("ajax.php", { user_id: sessionStorage.getItem('user_id'), order: order, task_id: match(task_id), parent_id: parent_id, key: '6'});
}
//Change check box
function check_box(link) {
    var task_id = match(link.parents('tr:first').attr('id'));
    var parent_id = link.parents('tr:first').parents('tr:first').attr('id');
    if(link.is(':checked')){
        var checkbox=1;
        link.prop("checked", true);
      }else{
        var checkbox=0;
        link.prop("checked", false);
      }
    $.post("ajax.php", { user_id: sessionStorage.getItem('user_id'), checkbox: checkbox, task_id: task_id, parent_id: parent_id, key: '7'});
}
//Set date of project
function change_data(data,task_id) {
    $.post("ajax.php", { user_id: sessionStorage.getItem('user_id'), data: data, task_id: match(task_id), key: '8'});
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
//Logout
function logout() {
    apprise('Are you sure you want to logout?',{'verify':true, 'textYes':'Yes', 'textNo':'No'}, function(data) {
      if(data){
       sessionStorage.removeItem('user');
       sessionStorage.removeItem('user_id');
       sessionStorage.removeItem('pass');
       html_nologin();
       }
    });
}
