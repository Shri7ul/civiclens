-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 17, 2026 at 04:05 AM
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
-- Database: `civiclens_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `name`, `email`, `phone`, `password`, `user_id`) VALUES
(1, 'System Admin', 'admin@civiclens.com', '01700000000', '1234', 7),
(2, 'Super Admin2', 'superadmin@gmail.com', '01711111111', NULL, 31);

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(255) DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `timestamp`) VALUES
(3, 1, 'Approved officer user 30', '2026-05-16 21:04:12');

-- --------------------------------------------------------

--
-- Table structure for table `authorities`
--

CREATE TABLE `authorities` (
  `id` int(11) NOT NULL,
  `nid` varchar(100) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `created_by_admin_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `authorities`
--

INSERT INTO `authorities` (`id`, `nid`, `dob`, `address`, `created_by_admin_id`, `user_id`) VALUES
(1, '987654321', '1980-01-01', 'Dhaka', 1, NULL),
(2, '485666', '2016-05-12', 'Street john bell road', NULL, 12);

-- --------------------------------------------------------

--
-- Table structure for table `case_documents`
--

CREATE TABLE `case_documents` (
  `id` int(11) NOT NULL,
  `police_request_id` int(11) DEFAULT NULL,
  `file_path` varchar(500) DEFAULT NULL,
  `uploaded_at` datetime DEFAULT current_timestamp(),
  `officer_id` int(11) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `case_documents`
--

INSERT INTO `case_documents` (`id`, `police_request_id`, `file_path`, `uploaded_at`, `officer_id`, `file_name`) VALUES
(1, 4, 'uploads\\case_documents\\cfd914866a834c839d2c2fe9a970df45.jpg', '2026-05-17 01:59:52', 2, '688893578_1472101947718584_5213215508521889970_n.jpg'),
(2, 6, 'uploads\\case_documents\\b9692192459340f298ee6fdff7ae5abb.jpg', '2026-05-17 04:22:42', 6, '688893578_1472101947718584_5213215508521889970_n.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `case_updates`
--

CREATE TABLE `case_updates` (
  `id` int(11) NOT NULL,
  `request_id` int(11) DEFAULT NULL,
  `status` varchar(100) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `updated_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `case_updates`
--

INSERT INTO `case_updates` (`id`, `request_id`, `status`, `note`, `updated_at`) VALUES
(1, 1, 'Under Investigation', 'Investigation Started', '2026-05-16 19:25:05'),
(2, 1, 'Under Investigation', 'Investigation Started', '2026-05-16 19:30:21'),
(3, 3, 'Suspect Identified', 'Accused detect', '2026-05-16 20:52:42'),
(4, 5, 'Suspect Identified', 'ggg', '2026-05-17 01:51:24'),
(5, 6, 'Suspect Identified', 'Accussed detect', '2026-05-17 04:22:46');

-- --------------------------------------------------------

--
-- Table structure for table `contractors`
--

CREATE TABLE `contractors` (
  `id` int(11) NOT NULL,
  `company` varchar(100) DEFAULT NULL,
  `license_no` varchar(100) DEFAULT NULL,
  `contact_info` varchar(255) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `created_by_admin_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `contractors`
--

INSERT INTO `contractors` (`id`, `company`, `license_no`, `contact_info`, `user_id`, `created_by_admin_id`) VALUES
(1, 'ABC Ltd', 'LIC123', '01711111111', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `crime_assignments`
--

CREATE TABLE `crime_assignments` (
  `id` int(11) NOT NULL,
  `police_request_id` int(11) DEFAULT NULL,
  `officer_id` int(11) DEFAULT NULL,
  `assigned_at` datetime DEFAULT current_timestamp(),
  `assigned_by_authority_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `crime_assignments`
--

INSERT INTO `crime_assignments` (`id`, `police_request_id`, `officer_id`, `assigned_at`, `assigned_by_authority_id`) VALUES
(1, 1, 1, '2026-05-16 18:58:44', NULL),
(2, 1, 1, '2026-05-16 19:03:22', NULL),
(3, 4, 2, '2026-05-16 20:09:50', NULL),
(4, 3, 2, '2026-05-16 20:51:43', NULL),
(5, 5, 2, '2026-05-17 01:50:46', NULL),
(6, 6, 6, '2026-05-17 04:21:18', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `crime_categories`
--

CREATE TABLE `crime_categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `crime_categories`
--

INSERT INTO `crime_categories` (`id`, `name`) VALUES
(1, 'GD'),
(2, 'Cyber Crime'),
(3, 'Theft');

-- --------------------------------------------------------

--
-- Table structure for table `demo_nid_data`
--

CREATE TABLE `demo_nid_data` (
  `id` int(11) NOT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `nid` varchar(100) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `demo_nid_data`
--

INSERT INTO `demo_nid_data` (`id`, `full_name`, `nid`, `dob`, `phone`) VALUES
(1, 'Rahim Ahmed', '123456789', '2003-05-10', '01711111111'),
(2, 'Karim Hasan', '987654321', '2001-08-15', '01822222222'),
(3, 'saffur', '123456789', '2016-05-16', '01111111');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `req_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `officers`
--

CREATE TABLE `officers` (
  `id` int(11) NOT NULL,
  `nid` varchar(100) DEFAULT NULL,
  `designation` varchar(100) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `created_by_admin_id` int(11) DEFAULT NULL,
  `area` varchar(100) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `officers`
--

INSERT INTO `officers` (`id`, `nid`, `designation`, `address`, `created_by_admin_id`, `area`, `user_id`) VALUES
(1, '123456789', 'SI', 'Dhaka', 1, 'Dhaka', NULL),
(2, '4586', 'SI', 'Mirpur 12', NULL, 'Dhaka', 11),
(3, '489654222', 'SI', 'Mirpur 12', 1, 'Dhaka', 27),
(4, '48963547', 'CA', 'mirpur 12', 1, 'DHAKA', 28),
(5, '488623554', 'CI', 'mirpur 12', 1, 'Dhaka', 29),
(6, '48886456543', 'CBI', 'mirpur121', 1, 'dhaka', 30);

-- --------------------------------------------------------

--
-- Table structure for table `police_requests`
--

CREATE TABLE `police_requests` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `category` varchar(100) DEFAULT NULL,
  `request_type` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `police_requests`
--

INSERT INTO `police_requests` (`id`, `user_id`, `category_id`, `description`, `status`, `created_at`, `category`, `request_type`) VALUES
(1, 1, 1, 'Lost NID card', 'Under Investigation', '2026-05-11 01:59:19', NULL, NULL),
(2, 23, NULL, 'dsgsdfg', 'Pending', '2026-05-16 17:21:31', 'Theft', 'f5MmT6'),
(3, 23, NULL, 'dsgdsgdgh', 'Suspect Identified', '2026-05-16 17:31:48', 'Theft', 'Street john bell road'),
(4, 25, NULL, 'Testing GD', 'Pending', '2026-05-16 18:10:52', 'Theft', 'Test'),
(5, 26, NULL, 'ghsdi hguiab gghj ', 'Suspect Identified', '2026-05-17 01:47:45', 'Fraud', 'tahkjsadb'),
(6, 33, NULL, 'sadgfg dasfu', 'Suspect Identified', '2026-05-17 04:19:05', 'Harassment', 'hjhsd');

-- --------------------------------------------------------

--
-- Table structure for table `tenders`
--

CREATE TABLE `tenders` (
  `id` int(11) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `contractor_id` int(11) DEFAULT NULL,
  `area` varchar(100) DEFAULT NULL,
  `budget` decimal(12,2) DEFAULT NULL,
  `deadline` date DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `approved_by_authority_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tenders`
--

INSERT INTO `tenders` (`id`, `title`, `category_id`, `contractor_id`, `area`, `budget`, `deadline`, `status`, `approved_by_authority_id`) VALUES
(1, 'Road Construction', 1, 1, 'Dhaka', 5000000.00, '2026-06-30', 'Ongoing', 1);

-- --------------------------------------------------------

--
-- Table structure for table `tender_assignments`
--

CREATE TABLE `tender_assignments` (
  `id` int(11) NOT NULL,
  `tender_id` int(11) DEFAULT NULL,
  `officer_id` int(11) DEFAULT NULL,
  `assigned_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tender_categories`
--

CREATE TABLE `tender_categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tender_categories`
--

INSERT INTO `tender_categories` (`id`, `name`, `description`, `created_at`) VALUES
(1, 'Road Development', 'Road related projects', '2026-05-11 01:59:27');

-- --------------------------------------------------------

--
-- Table structure for table `tender_documents`
--

CREATE TABLE `tender_documents` (
  `id` int(11) NOT NULL,
  `tender_id` int(11) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `document_type` varchar(100) DEFAULT NULL,
  `uploaded_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tender_updates`
--

CREATE TABLE `tender_updates` (
  `id` int(11) NOT NULL,
  `tender_id` int(11) DEFAULT NULL,
  `status` varchar(100) DEFAULT NULL,
  `progress_percentage` int(11) DEFAULT NULL,
  `updated_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` varchar(50) DEFAULT NULL,
  `is_approved` tinyint(1) DEFAULT 1,
  `is_rejected` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `is_approved`, `is_rejected`) VALUES
(1, 'Rahim', 'rahim@gmail.com', '1234', 'citizen', 1, 0),
(2, 'Karim', 'karim@gmail.com', '1234', 'citizen', 1, 0),
(3, 'Adnan Sami', 'user@example.com', '$2b$12$SCiJGJuytCbr7JjurISzHOMqsQyggH2q5ZMQoFIUF1KwPnQBH/2su', 'citizen', 1, 0),
(4, 'Officer Sami', 'officer@gmail.com', '$2b$12$7tcOsfz5IDppaidCyiuMLeUx6UQCTunEJU5ICYlPR/khZi7P.zhc6', 'officer', 1, 0),
(5, 'Sabbirul Islam', 'sabbirulislam@gmail.com', '$2b$12$7OvHivarY89eiKsYXZHzHO.eAjryIC..TD/oN4EStTSIMK6DswF.6', 'citizen', 1, 0),
(6, 'sabbirul', 'sabbirulofficer@gmail.com', '$2b$12$glIYwP108pzF0bTQJSt9luOye9EHWKIUHXOgGk991kOJ/QAT7Nk8.', 'officer', 0, 0),
(7, 'Admin', 'admin@gmail.com', '$2b$12$KnAQHIgYrH06FHBWAJNMheAgSBDz3vpJQeKMolpa5A3AId0WoaSye', 'admin', 1, 0),
(8, 'officer', 'officer1@gmail.com', '$2b$12$GPM4iMfXXO3LMn.7r5B1gub/0cn4n3VFh0wNSfwI0ItVF/nI12JQi', 'officer', 1, 0),
(9, 'rafi', 'rafi@gmail.com', '$2b$12$QU18SEVDzyPwrnhyLJqxeO7sfkwWYvXcU49.6ungX9ODZRljdCoTa', 'officer', 0, 0),
(10, 'rafi', 'rafi2@gmail.com', '$2b$12$AfUpNcTfPtfQD3DThBhxBugr39DXey.GGqib9stQBd5cy5Rfdx4n.', 'officer', 0, 0),
(11, 'rafi', 'officer2@gmail.com', '$2b$12$MbU.H6veD.cnkEEcBUy//OYmCTeKOKZnAcrzIn2hbiOl5kq1c9FAm', 'officer', 1, 0),
(12, 'authority2', 'authority2@gmail.com', '$2b$12$ScXenSUb0ms5yhf3AlOTbekU1GOwgLmfwiz0tVKOmkpOqhzi/9knG', 'authority', 1, 0),
(13, 'Sabbirul Islam', 'email@gmail.com', '$2b$12$5T1PUljmMymVsONJzpgIFOJ384lS7WG6pMYPwEGhy2VuQwPIYVWXe', 'citizen', 1, 0),
(14, 'gaddar', 'gaddar@gmail.com', '$2b$12$X3pPzx/m4cKFyhPGKhZ.C.K39CyGCqe79YKHuMOH7wgcLgmYc8wZm', 'citizen', 1, 0),
(15, 'tamal', 'tamal@gmail.com', '$2b$12$LwyGzpWWEuwPxb28M/8Ukeb8P.cSYT2KI1hN/M5PzIWGgDCkLd4WS', 'citizen', 1, 0),
(16, 'tamal', 'tamal1@gmail.com', '$2b$12$0ZH.wFJaBT4FhHtJhq2y4uQRZFaLadu8fjtGEYqSJBKjo6Ru/z0iS', 'citizen', 1, 0),
(17, 'tamal', 'tamal2@gmail.com', '$2b$12$bXfKpthtDw.By94obhjVAe1E.GvaX3kJMWcNsN1DMvP6kA4YMbsjK', 'citizen', 1, 0),
(18, 'tamal', 'tamal3@gmail.com', '$2b$12$d68pOfik7tPuQqvm4Nq86uaqU9fWccDR4u/WyYvW/7tsRqruExkLO', 'citizen', 1, 0),
(19, 'tamal', 'tamal4@gmail.com', '$2b$12$1yUsYLS7zCKIL5jYkbereuBxB1ve.7BDxNBeKPXwz57MlsI7mTvzy', 'citizen', 1, 0),
(20, 'sabbir', 'sabbir1@gmail.com', '$2b$12$g3J8Joyj1uyhfcC7jF/a7eHMZKmq4pCwPZ5yzENVnSG67UmCWUaO2', 'citizen', 1, 0),
(21, 'sabbir', 'sabbir2@gmail.com', '$2b$12$hzz6M/s/Gp9kHShVZDVTu.frJDGXT0pHBsojXNQiVTQNzAxKpf93W', 'citizen', 1, 0),
(22, 'sabbir4', 'sabbir4@gmail.com', '$2b$12$r8QXA98XC/B9jtaROoMDleQHBS194jzNIg7ce9/spTixn8Ns65rUi', 'citizen', 1, 0),
(23, 'saddir', 'sabbir5@gmail.com', '$2b$12$ErU7kq36kchhHvMJgj4BF.sUvR14NW8QYU0Oi38IhLKMQ3VjBpTLS', 'citizen', 1, 0),
(24, 'saffur', 'sabbir6@gmail.com', '$2b$12$/KuDz.4pSKtfUNnf5ty.yOEV86uJse7EqmBNC7uwJkWLMdTpsmJ76', 'citizen', 1, 0),
(25, 'Test User', 'test@example.com', '$2b$12$2lZvFWKt8J/Ljuvla4nm4ebcJsBOKJZ8TX0g.kicgu/E055D2VCgi', 'citizen', 1, 0),
(26, 'tanvirul ', 'tanvirul@gmail.com', '$2b$12$m/Rkk.5Xm..vrdtLZg6kQ.LeI2FXoB6KqDzapXb1zKrQQvB6jFUXC', 'citizen', 1, 0),
(27, 'shami', 'shami@gmail.com', '$2b$12$U5v1SoJT4LefHqbcJ1W3EuaANze7tnXaHCGtxqso89q3pCKfRI3z.', 'officer', 1, 0),
(28, 'testofficer', 'testofficer@gmail.com', '$2b$12$6Beo12/ESyC3dOpnF7TcbOjWPbWz4Kj95jCy08a1ekd.b99HOMv/O', 'officer', 1, 0),
(29, 'testofficer2', 'test2@gmail.com', '$2b$12$yA0Raei/wSh2NX7ARfXdeO.qXRsYAuPQiBJY.OOgKs39KniBZQxae', 'officer', 1, 0),
(30, 'officernew', 'officernew@gmail.com', '$2b$12$YuKcd.vxnjKVlBnnY9mMW.jFd3PsroGZyNzAoJnglXLcz0TBBGsIu', 'officer', 1, 0),
(31, 'Super Admin2', 'superadmin@gmail.com', '$2b$12$1EvzX/lex240ed9QWfM2vODlx./aGcPb3DAxWDgq5ODgtqiQUcbaG', 'admin', 1, 0),
(32, 'testcnfrm', 'testcnfrm@gmail.com', '$2b$12$2AIxRn/PmbFh35e6C0O5DOZmom0IPbDbE1eLKIgLUSLL6W2nVsnQ.', 'citizen', 1, 0),
(33, 'rarim', 'rarim@gmail.com', '$2b$12$Z.JER7c8.QF.NQua5afvde0UUcqQhGFMUR8phMAreD6RqdZ/zZ81m', 'citizen', 1, 0);

-- --------------------------------------------------------

--
-- Table structure for table `user_profiles`
--

CREATE TABLE `user_profiles` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_profiles`
--

INSERT INTO `user_profiles` (`id`, `user_id`, `phone`, `address`) VALUES
(3, 22, '7894561232', ''),
(4, 23, '485697123', 'Mirpur 12'),
(5, 24, '789456144', 'dhaka 12'),
(6, 25, '0123456789', 'Test Addr'),
(7, 26, '458893414', 'dhaka 12'),
(8, 32, '455888', ''),
(9, 33, '55555555', 'mirpur 12');

-- --------------------------------------------------------

--
-- Table structure for table `user_verification`
--

CREATE TABLE `user_verification` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `phone_verified` tinyint(1) DEFAULT 0,
  `nid_verified` tinyint(1) DEFAULT 0,
  `otp_code` varchar(10) DEFAULT NULL,
  `otp_expiry` datetime DEFAULT NULL,
  `nid` varchar(100) DEFAULT NULL,
  `dob` varchar(100) DEFAULT NULL,
  `verification_completed` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_verification`
--

INSERT INTO `user_verification` (`id`, `user_id`, `phone_verified`, `nid_verified`, `otp_code`, `otp_expiry`, `nid`, `dob`, `verification_completed`) VALUES
(3, 22, 1, 0, '781639', NULL, NULL, NULL, 0),
(4, 23, 1, 1, '161581', NULL, '123456789', '2016-05-16', 1),
(5, 24, 1, 1, '158898', NULL, '123456789', '2016-05-16', 1),
(6, 25, 1, 1, '620993', NULL, '123456789', '2003-05-10', 1),
(7, 26, 1, 1, '357929', NULL, '987654321', '2001-08-15', 1),
(8, 32, 0, 0, '571999', NULL, NULL, NULL, 0),
(9, 33, 1, 1, '978257', NULL, '123456789', '2016-05-16', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `authorities`
--
ALTER TABLE `authorities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by_admin_id` (`created_by_admin_id`),
  ADD KEY `fk_authority_user` (`user_id`);

--
-- Indexes for table `case_documents`
--
ALTER TABLE `case_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_case_documents_request` (`police_request_id`),
  ADD KEY `fk_case_documents_officer` (`officer_id`);

--
-- Indexes for table `case_updates`
--
ALTER TABLE `case_updates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `request_id` (`request_id`);

--
-- Indexes for table `contractors`
--
ALTER TABLE `contractors`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_contractor_user` (`user_id`),
  ADD KEY `fk_contractor_admin` (`created_by_admin_id`);

--
-- Indexes for table `crime_assignments`
--
ALTER TABLE `crime_assignments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_police_request` (`police_request_id`),
  ADD KEY `fk_officer` (`officer_id`);

--
-- Indexes for table `crime_categories`
--
ALTER TABLE `crime_categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `demo_nid_data`
--
ALTER TABLE `demo_nid_data`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `officers`
--
ALTER TABLE `officers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by_admin_id` (`created_by_admin_id`),
  ADD KEY `fk_officer_user` (`user_id`);

--
-- Indexes for table `police_requests`
--
ALTER TABLE `police_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `tenders`
--
ALTER TABLE `tenders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `contractor_id` (`contractor_id`),
  ADD KEY `approved_by_authority_id` (`approved_by_authority_id`);

--
-- Indexes for table `tender_assignments`
--
ALTER TABLE `tender_assignments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tender_id` (`tender_id`),
  ADD KEY `officer_id` (`officer_id`);

--
-- Indexes for table `tender_categories`
--
ALTER TABLE `tender_categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tender_documents`
--
ALTER TABLE `tender_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tender_id` (`tender_id`);

--
-- Indexes for table `tender_updates`
--
ALTER TABLE `tender_updates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tender_id` (`tender_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_profiles`
--
ALTER TABLE `user_profiles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `user_verification`
--
ALTER TABLE `user_verification`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `authorities`
--
ALTER TABLE `authorities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `case_documents`
--
ALTER TABLE `case_documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `case_updates`
--
ALTER TABLE `case_updates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `contractors`
--
ALTER TABLE `contractors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `crime_assignments`
--
ALTER TABLE `crime_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `crime_categories`
--
ALTER TABLE `crime_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `demo_nid_data`
--
ALTER TABLE `demo_nid_data`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `officers`
--
ALTER TABLE `officers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `police_requests`
--
ALTER TABLE `police_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `tenders`
--
ALTER TABLE `tenders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tender_assignments`
--
ALTER TABLE `tender_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tender_categories`
--
ALTER TABLE `tender_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tender_documents`
--
ALTER TABLE `tender_documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tender_updates`
--
ALTER TABLE `tender_updates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `user_profiles`
--
ALTER TABLE `user_profiles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `user_verification`
--
ALTER TABLE `user_verification`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `authorities`
--
ALTER TABLE `authorities`
  ADD CONSTRAINT `authorities_ibfk_1` FOREIGN KEY (`created_by_admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_authority_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `case_documents`
--
ALTER TABLE `case_documents`
  ADD CONSTRAINT `case_documents_ibfk_1` FOREIGN KEY (`police_request_id`) REFERENCES `police_requests` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_case_documents_officer` FOREIGN KEY (`officer_id`) REFERENCES `officers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_case_documents_request` FOREIGN KEY (`police_request_id`) REFERENCES `police_requests` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `case_updates`
--
ALTER TABLE `case_updates`
  ADD CONSTRAINT `case_updates_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `police_requests` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `contractors`
--
ALTER TABLE `contractors`
  ADD CONSTRAINT `fk_contractor_admin` FOREIGN KEY (`created_by_admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_contractor_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `crime_assignments`
--
ALTER TABLE `crime_assignments`
  ADD CONSTRAINT `crime_assignments_ibfk_1` FOREIGN KEY (`police_request_id`) REFERENCES `police_requests` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `crime_assignments_ibfk_2` FOREIGN KEY (`officer_id`) REFERENCES `officers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_officer` FOREIGN KEY (`officer_id`) REFERENCES `officers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_police_request` FOREIGN KEY (`police_request_id`) REFERENCES `police_requests` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `officers`
--
ALTER TABLE `officers`
  ADD CONSTRAINT `fk_officer_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `officers_ibfk_1` FOREIGN KEY (`created_by_admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `police_requests`
--
ALTER TABLE `police_requests`
  ADD CONSTRAINT `police_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `police_requests_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `crime_categories` (`id`);

--
-- Constraints for table `tenders`
--
ALTER TABLE `tenders`
  ADD CONSTRAINT `tenders_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `tender_categories` (`id`),
  ADD CONSTRAINT `tenders_ibfk_2` FOREIGN KEY (`contractor_id`) REFERENCES `contractors` (`id`),
  ADD CONSTRAINT `tenders_ibfk_3` FOREIGN KEY (`approved_by_authority_id`) REFERENCES `authorities` (`id`);

--
-- Constraints for table `tender_assignments`
--
ALTER TABLE `tender_assignments`
  ADD CONSTRAINT `tender_assignments_ibfk_1` FOREIGN KEY (`tender_id`) REFERENCES `tenders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tender_assignments_ibfk_2` FOREIGN KEY (`officer_id`) REFERENCES `officers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tender_documents`
--
ALTER TABLE `tender_documents`
  ADD CONSTRAINT `tender_documents_ibfk_1` FOREIGN KEY (`tender_id`) REFERENCES `tenders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tender_updates`
--
ALTER TABLE `tender_updates`
  ADD CONSTRAINT `tender_updates_ibfk_1` FOREIGN KEY (`tender_id`) REFERENCES `tenders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_profiles`
--
ALTER TABLE `user_profiles`
  ADD CONSTRAINT `user_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_verification`
--
ALTER TABLE `user_verification`
  ADD CONSTRAINT `user_verification_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
