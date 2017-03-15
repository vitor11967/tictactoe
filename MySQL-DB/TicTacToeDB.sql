-- Adminer 4.2.5 MySQL dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

DROP DATABASE IF EXISTS `TicTacToeUsers`;
CREATE DATABASE `TicTacToeUsers` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `TicTacToeUsers`;

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `_id` varchar(50) NOT NULL,
  `username` varchar(50) NOT NULL,
  `name` varchar(50) NOT NULL,
  `email` varchar(200) NOT NULL,
  `passwordhash` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


-- 2017-03-14 15:49:40
