<?php
$auth = array(
	      "dima" => array(
			   "user_id"=>"1",
			   "user"=>"dima",
                           "pass"=>"123"
		     ),
              "test" => array(
                           "user_id"=>"2",
                           "user"=>"test",
                           "pass"=>"test"
                     )
	);
if(array_key_exists($_POST['user'],$auth)){
	if($auth[$_POST['user']]['pass'] == $_POST['pass']){
		echo $auth[$_POST['user']]['user_id'];
}	}
?>
