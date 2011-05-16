<?php
$f = fopen("./colortable.txt", 'r');

function stripEmpties($arr)
{
    $stripped = array();
    foreach ($arr as $item)
    {
        if (trim($item) != '')
            array_push($stripped, $item);
    }
    return $stripped;
}

while (($row = fgetcsv($f, 1000, ' ')) !== FALSE)
{
    $row = stripEmpties($row);
    
    if ($row[2] != "10deg")
        continue;
    
    print 'colorTempTable["' . $row[0] . '"] = ';
    print '"' . $row[12] . '"';
    print "\n";
}
?>