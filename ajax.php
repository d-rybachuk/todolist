<?php 
include "connect.php";
/* Tables
 `projects` (`id`,`name`,`user_id`,`date`)
 `tasks` ( `id`,`sort_id`,`name`,`status`,`project_id`)
*/
$user_id = $mysqli->real_escape_string($_GET['user_id']);
$task = $mysqli->real_escape_string($_GET['task']);
$parent_id = $mysqli->real_escape_string($_GET['parent_id']);
$task_id = $mysqli->real_escape_string($_GET['task_id']);
$data = $_GET['data'];


switch ($_GET['key']){
//Init first
case 1:
  if (empty($user_id)){
    echo "Inserted value is empty";
  }else{
    init($user_id,'','');
  }
  break;
//Add project
case 2:
  if (empty($task) || empty($user_id)){
    echo "Inserted value is empty";
  }else{
    if(!$mysqli->query("INSERT INTO projects (name,user_id) VALUES ('".$task."','".$user_id."');")){
      echo "Error:".$mysqli->error;
    }else{
      $parent_id = $mysqli->insert_id;
      init($user_id,$parent_id,'');
    }
  }
  break;
//Add task 
case 3:
  if (empty($task) || empty($parent_id)){
    echo "Inserted value is empty";
  }else{
    if(!$mysqli->query("INSERT INTO tasks (name,project_id) VALUES ('".$task."','".$parent_id."');")){
      echo "Error:".$mysqli->error;
    }else{
      $task_id = $mysqli->insert_id;
      init($user_id,$parent_id,$task_id);
    }
  }
  break;
//Delete
case 4:
  ($parent_id)? $table = "tasks" : $table = "projects";
  $mysqli->query("DELETE FROM ".$table." WHERE id='".$task_id."'" );
  break;
//UPDATE name
case 5:
  if (empty($task)){
    echo "Inserted value is empty";
  }else{
    if(!$parent_id){
      $mysqli->query("UPDATE projects set name ='".$task."' WHERE user_id='".$user_id."' AND  id='".$task_id."' limit 1;");
    }else{
      $mysqli->query("UPDATE tasks set name ='".$task."' WHERE id='".$task_id."' AND project_id='".$parent_id."' limit 1;");
    }
  }
  break;
//Set priority of tasks
case 6:
  parse_str($_GET['order']);
  $i=1;
  foreach ($task as $key=>$val){
    if(!$mysqli->query("UPDATE tasks set sort_id ='".$i."' WHERE id='".$val."' AND project_id='".$task_id."' limit 1;")){
      echo json_encode("Error:".$mysqli->error);
    }
    $i++;
  }
  break;
//Get checkbox status
case 7:
  $checkbox = $_GET['checkbox'];
  $mysqli->query("UPDATE tasks set status ='".$checkbox."' WHERE id='".$task_id."' AND project_id='".$parent_id."' limit 1;");
  break;
//Set date of prject
case 8:
  if (empty($data) || empty($task_id)){
    echo "Inserted value is empty";
  }else{
    $mysqli->query("UPDATE projects set date ='".$data."' WHERE id='".$task_id."' limit 1;");
  }
  break;
//Get date of project
case 9:
  if (empty($task_id)){
    echo "Inserted value is empty";
  }else{
    $q = $mysqli->query("SELECT date FROM projects WHERE id='".$task_id."' limit 1;");
    $row = mysqli_fetch_array($q);
    echo json_encode($row['date']);
  }
  break;
}

$mysqli->close();
//First init of page
function init($user_id,$parent_id,$task_id){
global $mysqli;
$task = array();
($parent_id)? $parent_sql="AND id ='".$parent_id."'" : $parent_sql="";
($task_id)? $task_sql="AND id ='".$task_id."'" : $task_sql="";
  $q = $mysqli->query("
        SELECT 
        id as project_id,
        name as project_name,
	date
        FROM projects 
        WHERE user_id='".$user_id."' ".$parent_sql." ORDER BY project_id;");
  $i=0;
  while($row = mysqli_fetch_array($q)) {
      $projects = array($i =>array(
                          "id"=>$row['project_id'],
                          "task"=>$row['project_name'],
                          "data"=>$row['date'],
                        )
                );
      $task = array_merge((array)$projects, (array)$task);
    $i++;
  }

  foreach($task as $key =>$val){
        $q_sub = $mysqli->query("
                SELECT 
                id as task_id,
                sort_id as sort,
                name as task_name,
                project_id,
                status
                FROM tasks 
                WHERE project_id='".$task[$key]['id']."' ".$task_sql." ORDER BY sort;");
        $k=0;
        while($row_sub = mysqli_fetch_array($q_sub)) {
                $task[$key]['subtask'][$k] =  array(
                                                        "id"=>$row_sub['task_id'],
                                                        "parent_id"=>$row_sub['project_id'],
                                                        "task"=>$row_sub['task_name'],
							"checkbox"=>$row_sub['status']
                                          );
                $k++;
        }
  }
echo json_encode($task);
}
?>
