-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 13, 2025 at 10:46 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `restaurantdb`
--

-- --------------------------------------------------------

--
-- Table structure for table `reservations`
--

CREATE TABLE `reservations` (
  `reservation_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `restaurant_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `time` time NOT NULL,
  `people_count` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reservations`
--

INSERT INTO `reservations` (`reservation_id`, `user_id`, `restaurant_id`, `date`, `time`, `people_count`, `created_at`) VALUES
(1, 4, 1, '2025-05-10', '13:45:00', 1, '2025-05-09 10:39:03'),
(2, 4, 1, '2025-05-09', '13:39:00', 1, '2025-05-09 10:39:11'),
(3, 4, 1, '2025-05-09', '13:39:00', 1, '2025-05-09 10:39:14'),
(4, 4, 2, '2025-05-09', '13:39:00', 1, '2025-05-09 10:39:25'),
(8, 3, 2, '2025-05-09', '10:45:00', 3, '2025-05-09 11:30:13'),
(21, 3, 1, '2025-05-09', '16:42:00', 3, '2025-05-09 12:42:44'),
(25, 3, 1, '2025-05-09', '16:41:00', 2, '2025-05-09 13:41:08'),
(26, 3, 2, '2025-05-09', '17:00:00', 1, '2025-05-09 14:00:31'),
(27, 3, 1, '2025-05-09', '21:05:00', 1, '2025-05-09 18:05:19'),
(28, 3, 1, '2025-05-09', '22:10:00', 2, '2025-05-09 19:10:25'),
(31, 3, 1, '2025-05-12', '20:15:00', 3, '2025-05-12 11:29:25');

-- --------------------------------------------------------

--
-- Table structure for table `restaurants`
--

CREATE TABLE `restaurants` (
  `restaurant_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `location` varchar(255) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `restaurants`
--

INSERT INTO `restaurants` (`restaurant_id`, `name`, `location`, `description`) VALUES
(1, 'The Italian Bistro', 'Rome, Italy', 'A cozy Italian restaurant offering authentic pasta and pizza.'),
(2, 'Sushi World', 'Tokyo, Japan', 'Fresh sushi and sashimi served with a beautiful view of the city.'),
(3, 'Taco Palace', 'Mexico City, Mexico', 'Authentic Mexican tacos and street food with a modern twist.'),
(4, 'Cafe de Paris', 'Paris, France', 'A chic cafe serving croissants, coffee, and exquisite pastries.');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `name`, `email`, `password`) VALUES
(1, 'evang', 'evang@example.com', '123456'),
(2, 'andrew', 'Andrew@email.com', '$2b$10$ZBO7mbBlKWsF6WG.MwPvsumfk2itEuANMh9FQv24e.iR9906qUumC'),
(3, 'App', 'Apo@app.com', '$2b$10$/uLbjJ9SVloc3ndzXflbUeJSmiDJC0bj5rU.JWLMVajiT.raJxJXe'),
(4, 'George', 'George@mail.com', '$2b$10$OVTwq4/V/BICJON1jQyYnu4A98h7nhyNsyYm0BUOqcfZcZNKMLbVu'),
(5, 'User', 'User@user.gr', '$2b$10$fb2YU8o3ycfoW1opoBy7AeipRImlHWQ3mQgbb.QfLDjGG4mdI3shu');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `reservations`
--
ALTER TABLE `reservations`
  ADD PRIMARY KEY (`reservation_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `restaurant_id` (`restaurant_id`);

--
-- Indexes for table `restaurants`
--
ALTER TABLE `restaurants`
  ADD PRIMARY KEY (`restaurant_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `reservations`
--
ALTER TABLE `reservations`
  MODIFY `reservation_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `restaurants`
--
ALTER TABLE `restaurants`
  MODIFY `restaurant_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `reservations`
--
ALTER TABLE `reservations`
  ADD CONSTRAINT `reservations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reservations_ibfk_2` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`restaurant_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
