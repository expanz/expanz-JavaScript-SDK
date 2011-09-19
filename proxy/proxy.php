<?PHP

// Dead Simple PHP POST proxy
// author: Adam Tait (http://about.me/adamtait)
// ############################################################################


$url = $_POST['url'];
$data = str_replace( '\"', '"', $_POST['data'] );

$ch = curl_init( $url );
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: text/xml'));
curl_setopt($ch, CURLOPT_HEADER, 0);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $data );
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 0);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
  
list( $header, $contents ) = preg_split( '/([\r\n][\r\n])\\1/', curl_exec( $ch ), 2 );
$status = curl_getinfo( $ch );
curl_close( $ch );

print $header;

?>
