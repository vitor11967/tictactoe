<?php
require_once('vendor/autoload.php');
use Firebase\JWT\JWT;

// Token Configuration
$secret = 'randomstr-efr23fe2r3fegrbnj65645rfghuy4t4gh56r4fw924f9ue1)HG(&F&%"/FT)';
$hostname = 'http://cn0.dev';

function addCors()
{
    if (isset($_SERVER['HTTP_ORIGIN'])) {
        header("Access-Control-Allow-Origin: $hostname");
        header('Access-Control-Allow-Headers: Origin, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Response-Time, X-PINGOTHER, X-CSRF-Token, Authorization');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Expose-Headers: X-Api-Version, X-Request-Id, X-Response-Time');
        header('Access-Control-Max-Age: 1000');
    }
}

function getInputParam($inputParamName, $default = null)
{
    $input = file_get_contents('php://input');
    $post = json_decode($input, true);
    if (is_array($post)) {
        if (array_key_exists($inputParamName, $post)) {
            return $post[$inputParamName];
        }
    }
    return $default;
}
     
$globalVarWithDBConnection = null;
function db()
{
    global $globalVarWithDBConnection;
    $serverName = "localhost";
    $dbName     = "TicTacToeUsers";
    $userName   = "homestead";
    $password   = "secret";

    if ($globalVarWithDBConnection == null) {
        $globalVarWithDBConnection =  new mysqli($serverName, $userName, $password, $dbName);
    }
    return $globalVarWithDBConnection;
}

function createToken($userId, $username, $name, $email)
{
    global $secret;
    global $hostname;

    //$tokenId= base64_encode(mcrypt_create_iv(32));
    $tokenId= base64_encode(openssl_random_pseudo_bytes(32));
    $issuedAt= time();
    
    $userInfo = [
        'userID'   => $userId,
        'username' => $username,
        'name'     => $name,
        'email'    => $email
    ];

    $data = [
        'iat'  => $issuedAt,                   // Issued at: time when the token was generated
        'jti'  => $tokenId,                    // Json Token Id: an unique identifier for the token
        'iss'  => $hostname,                   // Issuer
        'exp'  => $issuedAt + 240*60,          // Expire - in seconds
        'data' => (object) $userInfo // Data related to the signer user
    ];

    $secretKey = base64_decode($secret);
    $jwt = JWT::encode(
        $data,        //Data to be encoded in the JWT
        $secretKey,   // The signing key
        'HS256'       // Algorithm used to sign the token == Default from jsonwebtoken
    );
    return $jwt;
}

function validateToken()
{
    global $secret;
    
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    
    if (!empty($authHeader)) {
        list($jwt) = sscanf($authHeader, 'Bearer %s');
        if (!empty($jwt)) {
            try {
                $secretKey = base64_decode($secret);
                $token = JWT::decode($jwt, $secretKey, array('HS256'));
                return $token->data;
            } catch (Exception $e) {
                return false;
            }
        }
    }
    return false;
}
