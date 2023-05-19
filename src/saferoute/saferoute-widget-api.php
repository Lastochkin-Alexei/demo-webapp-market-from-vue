<?php

include_once "SafeRouteWidgetApi.php";


$widgetApi = new SafeRouteWidgetApi();

// Укажите здесь свой токен
$widgetApi->setToken('79QDu-lS0utth00FokfKn57mM9B5x8sH');
// А здесь ID магазина
$widgetApi->setShopId('79138');

$request = ($_SERVER['REQUEST_METHOD'] === 'POST')
    ? json_decode(file_get_contents('php://input'), true)
    : $_REQUEST;

$widgetApi->setMethod($_SERVER['REQUEST_METHOD']);
$widgetApi->setData(isset($request['data']) ? $request['data'] : []);

echo $widgetApi->submit($request['url']);
