<?php
$mysqli = new mysqli("localhost", "ruby", "rubypass", "ruby");

/* проверка соединения */
if (mysqli_connect_errno()) {
    printf("Не удалось подключиться: %s\n", mysqli_connect_error());
    exit();
}

?>
