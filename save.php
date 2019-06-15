<?php

if($_SERVER['REMOTE_ADDR'] == '127.0.0.1'){
    if(isset($_POST['filename'])){
        file_put_contents('data/' . $_POST['filename'], $_POST['text']);
    }
}
