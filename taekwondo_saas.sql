-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Apr 20, 2026 at 03:53 PM
-- Server version: 8.4.3
-- PHP Version: 8.3.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `taekwondo_saas`
--

-- --------------------------------------------------------

--
-- Table structure for table `belts`
--

CREATE TABLE `belts` (
  `id` int NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `color` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `level_order` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `belts`
--

INSERT INTO `belts` (`id`, `name`, `color`, `level_order`) VALUES
(1, 'White Belt (10th Gup)', '#FFFFFF', 1),
(2, 'Yellow Belt (9th Gup)', '#FFD700', 2),
(3, 'Yellow-Green Belt (8th Gup)', '#9ACD32', 3),
(4, 'Green Belt (7th Gup)', '#228B22', 4),
(5, 'Green-Blue Belt (6th Gup)', '#2E8B57', 5),
(6, 'Blue Belt (5th Gup)', '#0000CD', 6),
(7, 'Blue-Red Belt (4th Gup)', '#4169E1', 7),
(8, 'Red Belt (3rd Gup)', '#DC143C', 8),
(9, 'Red-Black Belt (2nd Gup)', '#8B0000', 9),
(10, 'Black Belt Candidate (1st Gup)', '#1C1C1C', 10),
(11, 'Black Belt (1st Dan)', '#000000', 11),
(12, 'Black Belt (2nd Dan)', '#000000', 12),
(13, 'Black Belt (3rd Dan)', '#000000', 13);

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('championship','test','gathering') COLLATE utf8mb4_unicode_ci NOT NULL,
  `event_date` datetime(3) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `image_url` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` decimal(12,2) DEFAULT NULL,
  `location` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `map_url` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `events`
--

INSERT INTO `events` (`id`, `title`, `type`, `event_date`, `created_at`, `updated_at`, `description`, `image_url`, `price`, `location`, `map_url`) VALUES
('05e31764-c5e8-41e7-845e-a626249ecac1', 'Ujian Kenaikan Sabuk', 'test', '2026-04-24 16:55:00.000', '2026-04-10 16:56:37.524', '2026-04-10 16:56:37.524', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras congue malesuada erat ut commodo. Morbi ultrices nisl finibus risus posuere elementum. Donec auctor, turpis sed rhoncus molestie, sapien lectus porttitor augue, et egestas elit risus sit amet justo. Curabitur non vehicula nunc. In sit amet ante arcu. Nam vestibulum, nunc vitae porttitor ultricies, nunc ligula commodo mauris, eget placerat dolor mi ac ligula. Phasellus ut consequat metus. Vestibulum feugiat venenatis elementum. Curabitur ut convallis libero. Nulla facilisi. Etiam laoreet sodales lorem eget egestas.\r\n\r\nDonec sed elementum justo. Integer lacus nibh, blandit eget rhoncus ac, feugiat quis est. Ut tristique, dolor et molestie condimentum, arcu tellus consequat justo, at fermentum orci neque quis nunc. Curabitur eget porta enim. Pellentesque neque dolor, ultricies lobortis sem et, luctus semper nisi. Quisque vehicula, mauris sit amet lacinia pellentesque, lectus dui ullamcorper lacus, vel ullamcorper neque lorem ac lacus. Aliquam tempor est in ultricies vestibulum. Donec euismod vestibulum elit, ac sollicitudin lacus gravida ac.\r\n\r\nVivamus dignissim tortor in nisl tincidunt mollis. Phasellus nisi nulla, venenatis at rhoncus ut, gravida ut magna. In dignissim, quam sed faucibus bibendum, mi lacus euismod augue, vel molestie eros enim eget massa. Nam egestas congue congue. Fusce a porta libero, in viverra lectus. Integer non diam sit amet ligula faucibus hendrerit in eu velit. Cras id convallis tortor. Curabitur luctus lacinia tristique. Quisque rutrum porta pulvinar. Sed imperdiet tempus magna. Aenean luctus risus a dolor pulvinar cursus. Nam scelerisque est in tristique viverra.', 'image-1775840197506-63831740.png', 250000.00, 'Radar Banten', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126914.511052212!2d105.98995177518242!3d-6.253391686719311!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e418ad8b2f02a2f%3A0x1a43751e0e4ffccb!2sRadar%20Banten%20%26%20Graha%20Pena%20Ballroom!5e0!3m2!1sid!2sid!4v1775840153141!5m2!1sid!2sid'),
('57e246f6-5890-4fd9-91cb-ed1ad5e3e7d2', 'Kejuaraan Nasional Tingkat 2', 'championship', '2026-07-08 02:00:00.000', '2026-04-19 04:23:20.167', '2026-04-19 04:23:20.167', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque at gravida massa. Quisque consequat dolor nibh. Cras rutrum augue non mauris eleifend, nec porttitor sapien rhoncus. Mauris dictum tincidunt tortor, ac euismod nisl consectetur a. Praesent eget tortor est. In ut nunc tellus. Proin metus dui, porttitor ac efficitur eu, elementum a mi. Etiam eu laoreet mauris, quis dictum tellus. Proin semper quis nibh ac luctus.\r\n\r\nMorbi eget ex odio. Aliquam id ante et neque tempus mollis. Pellentesque ultricies diam sed dolor faucibus, nec ullamcorper lorem venenatis. Aenean ut tempor leo. Pellentesque in suscipit ipsum. Proin mollis non nulla rutrum blandit. Proin nisi massa, vulputate quis eros quis, elementum sollicitudin nulla. Sed nulla dolor, tempus eget velit vitae, eleifend vestibulum velit. Duis posuere sagittis justo, ut mollis orci scelerisque in. Curabitur aliquam vel quam et dignissim. Nullam tristique nibh at magna scelerisque ornare. Aenean mi ex, eleifend sagittis laoreet fringilla, mattis eget leo. Sed sit amet dui in felis ullamcorper dapibus.\r\n\r\nMauris dignissim mollis faucibus. Quisque laoreet metus ac pellentesque pretium. In consectetur massa eget diam posuere malesuada. Donec id risus eget justo viverra convallis. Maecenas rutrum fermentum lectus, ut accumsan odio. Ut non odio fermentum, mattis orci non, euismod eros. Aenean quis diam pellentesque, tincidunt diam non, dignissim orci. Curabitur dapibus porta enim sed fermentum. Proin magna nisi, rhoncus eu ex eget, luctus accumsan nisi. Etiam interdum imperdiet ullamcorper. Nunc viverra sed odio quis suscipit.\r\n\r\nVestibulum ultricies massa non pulvinar posuere. Ut luctus elit eu ornare interdum. Duis enim arcu, suscipit sed varius ac, hendrerit vitae neque. Nam sed elit dictum, dictum sem a, semper metus. Nunc viverra mi ut magna blandit facilisis vel ac dui. Aliquam imperdiet iaculis nisi, a ultricies mauris pharetra et. Morbi nec accumsan ipsum. Maecenas sit amet nisi cursus, fermentum nisl non, pretium arcu. Mauris a sapien justo. Cras vel augue quis nisl consequat pellentesque. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vel varius magna, vel tempor nisi. In hac habitasse platea dictumst. Curabitur ac nibh et libero mollis mattis eget sit amet arcu.\r\n\r\nFusce at maximus tortor. Vestibulum enim justo, tristique ac nisi a, faucibus consectetur urna. Fusce a orci pulvinar, placerat felis et, tempor nibh. Pellentesque a pharetra dolor. Vestibulum sed felis vulputate, lobortis elit id, tincidunt nibh. Vestibulum elementum nec nisl vitae cursus. Integer sodales mauris ac nulla lobortis tincidunt. Curabitur dignissim, arcu id maximus ullamcorper, velit magna pretium massa, id vestibulum ligula odio vitae tortor.', 'image-1776572600156-392955772.png', 530000.00, 'Korea Selatan', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3165.005771473049!2d127.0300152764222!3d37.50778202749425!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x357ca3fa50340025%3A0x7724ef7b6f08ebeb!2sDojang!5e0!3m2!1sid!2sid!4v1776572538587!5m2!1sid!2sid'),
('6a9f948f-d5c9-4dc5-a163-0c260f81d29f', 'Ujian Kenaikan Sabuk Tahap 2', 'test', '2026-04-21 17:01:00.000', '2026-04-20 13:42:43.656', '2026-04-20 13:42:43.656', 'CEK', 'image-1776692563539-447887341.webp', 250000.00, 'GOR SAHABUDIN', NULL),
('894fca2e-4a30-44e3-b76f-0a18ce4321b0', 'kejuaraan nasional', 'championship', '2026-04-23 10:12:00.000', '2026-04-10 10:14:12.859', '2026-04-10 10:14:12.859', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec et nisi in dui sodales volutpat ut ac ex. Integer sit amet pretium nisl. Nunc egestas erat vitae felis molestie placerat. Donec non accumsan ex, non fringilla eros. Donec egestas auctor ante eget mollis. Aliquam tincidunt, justo in tempor scelerisque, urna odio laoreet eros, ac fringilla ipsum felis in justo. Nam nec est tincidunt, tempus magna sit amet, feugiat nisi.\r\n\r\nPhasellus non massa non velit gravida placerat. Proin lobortis faucibus dolor eget iaculis. Suspendisse non elit ac velit finibus viverra nec et est. Donec imperdiet massa libero, in fermentum massa tincidunt a. Mauris hendrerit enim sit amet pellentesque rhoncus. Sed at magna posuere, consectetur metus et, sollicitudin dui. Maecenas in arcu a mi pellentesque lacinia ac nec urna. Aliquam nibh augue, accumsan in euismod nec, finibus eu lorem. Vivamus ac diam sed elit convallis porta cursus et ex. Cras vestibulum id purus et blandit. Nullam accumsan eu nisi eu tincidunt. Sed et sagittis erat.\r\n\r\nClass aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Sed libero massa, luctus eget consectetur quis, porttitor quis leo. Ut fringilla luctus arcu ut commodo. Proin pulvinar sem eu risus malesuada volutpat. Mauris felis sapien, dignissim vitae ex sed, tincidunt porta metus. Nunc facilisis pharetra neque, quis aliquam metus placerat id. Quisque convallis, turpis at aliquet tristique, orci ipsum venenatis mauris, ut fermentum dolor velit id nibh. Nam purus dolor, ullamcorper nec lorem ut, laoreet pulvinar quam. Nunc suscipit tempor massa quis luctus. Mauris finibus hendrerit consectetur. Nunc ultrices ligula metus, in rhoncus tortor tempus non. Mauris id tellus a sapien egestas lobortis. Aliquam ornare ipsum ullamcorper, consectetur nulla at, aliquet sem. Pellentesque aliquet arcu et turpis commodo, sit amet aliquam mi bibendum. In ex nisi, blandit non rutrum vitae, scelerisque quis lectus.\r\n\r\nPellentesque sollicitudin tellus a bibendum elementum. Suspendisse sem quam, lacinia sit amet placerat sit amet, scelerisque in lacus. Vestibulum vitae fermentum massa. Interdum et malesuada fames ac ante ipsum primis in faucibus. Donec molestie neque metus, nec scelerisque diam elementum in. Nulla id mi non orci tincidunt imperdiet vitae at nunc. Vivamus accumsan eros in mi elementum hendrerit. Etiam eleifend, nunc quis sagittis luctus, mauris lorem volutpat massa, ac pretium leo lectus a augue. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.', 'image-1775816052788-94349450.png', 200000.00, 'GOR POPKI', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.2036309517234!2d106.88742497589278!3d-6.3676880622924!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69ecbd4711715f%3A0xa0727bee0bac717!2sGOR%20POPKI%20Cibubur!5e0!3m2!1sid!2sid!4v1775815976111!5m2!1sid!2sid');

-- --------------------------------------------------------

--
-- Table structure for table `event_registrations`
--

CREATE TABLE `event_registrations` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `event_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `invoice_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `age` int DEFAULT NULL,
  `birth_date` datetime(3) DEFAULT NULL,
  `birth_place` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gender` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `participant_name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `weight` double DEFAULT NULL,
  `competition_category` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `level_category` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `event_registrations`
--

INSERT INTO `event_registrations` (`id`, `user_id`, `event_id`, `invoice_id`, `status`, `created_at`, `age`, `birth_date`, `birth_place`, `gender`, `participant_name`, `weight`, `competition_category`, `level_category`) VALUES
('294d3021-c379-40c1-9346-e648f4712d3c', '427f709a-f8a5-4e54-be1f-2ee0ad3335b9', '894fca2e-4a30-44e3-b76f-0a18ce4321b0', '546c1701-0f49-4949-8534-5cb45b8975ed', 'confirmed', '2026-04-19 15:25:42.921', 25, '2000-11-08 00:00:00.000', 'tegal', 'Laki-laki', 'farras azhary', 22, 'Kyorugi', 'Pemula'),
('a361e87a-1be5-442d-ac59-1190a9605bc4', '82eced43-825a-4556-8d76-1461b085d343', '894fca2e-4a30-44e3-b76f-0a18ce4321b0', '866d4923-3a3d-44e2-a9e7-20054ae42482', 'confirmed', '2026-04-18 13:00:52.470', 1925, '0101-01-20 00:00:00.000', 'Jakarta', 'Laki-laki', 'John Doe Participant', 70, 'Kyorugi', 'Pemula'),
('b0692487-4ed5-47a9-bfa9-2da0cd53c429', '82eced43-825a-4556-8d76-1461b085d343', '05e31764-c5e8-41e7-845e-a626249ecac1', 'a343644b-b916-419f-a15e-368a3e0f3046', 'pending', '2026-04-18 13:18:40.711', 36, '1990-01-01 00:00:00.000', 'Jakarta', 'Laki-laki', 'John Doe', 70, 'Kyorugi', 'Pemula'),
('b576ddbf-57f9-4d0f-b67b-723ddc176de4', '427f709a-f8a5-4e54-be1f-2ee0ad3335b9', '05e31764-c5e8-41e7-845e-a626249ecac1', 'dd79f4ab-89ef-414f-a138-f372a5f09b93', 'confirmed', '2026-04-19 15:03:31.566', 25, '2000-11-08 00:00:00.000', 'tegal', 'Laki-laki', 'farras azhary', 77, 'Kyorugi', 'Pemula');

-- --------------------------------------------------------

--
-- Table structure for table `gallery`
--

CREATE TABLE `gallery` (
  `id` int NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `image` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `gallery`
--

INSERT INTO `gallery` (`id`, `title`, `description`, `image`, `created_at`) VALUES
(1, 'asdasda', 'asdasdds', 'galleryImage-1776514540353-283691307.jpeg', '2026-04-18 12:15:40.373'),
(2, 'Juara 1 Kyorugi', 'Medali Emas Kejuaraan Nasional 2026', 'dummy-gallery-1.png', '2026-04-18 12:17:26.567'),
(3, 'Ujian Sabuk Hitam', 'Pencapaian luar biasa generasi muda', 'dummy-gallery-2.png', '2026-04-18 12:17:26.567');

-- --------------------------------------------------------

--
-- Table structure for table `invoices`
--

CREATE TABLE `invoices` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `status` enum('unpaid','pending_verification','paid','expired','failed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'unpaid',
  `payment_url` text COLLATE utf8mb4_unicode_ci,
  `due_date` datetime(3) NOT NULL,
  `paid_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `payment_method` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'manual',
  `payment_proof` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `invoices`
--

INSERT INTO `invoices` (`id`, `user_id`, `title`, `amount`, `status`, `payment_url`, `due_date`, `paid_at`, `created_at`, `updated_at`, `payment_method`, `payment_proof`) VALUES
('056ad690-5760-40a6-b237-3002e3d885b7', 'fdd5425d-027b-4560-a68a-3f77a5dad753', 'Pendaftaran Member Reguler', 200000.00, 'paid', NULL, '2026-04-18 08:46:21.307', '2026-04-17 08:46:22.778', '2026-04-17 08:46:21.316', '2026-04-17 08:46:22.782', 'manual', NULL),
('133a556b-4ef3-4284-849e-b851b68773c0', '4f0a4087-f68a-43df-8bd1-e874e23530b8', 'ujang', 300000.00, 'paid', NULL, '2026-04-30 00:00:00.000', '2026-04-18 10:42:39.306', '2026-04-18 10:41:13.743', '2026-04-18 10:42:39.313', 'manual', NULL),
('2a6e8397-f936-4c13-9243-efd40e01bc50', 'c0c7dc44-445d-4154-9c4e-6f1131b55bf2', 'Pendaftaran Member Private', 500000.00, 'unpaid', NULL, '2026-04-20 14:57:18.495', NULL, '2026-04-19 14:57:18.496', '2026-04-19 14:57:18.496', 'manual', NULL),
('546c1701-0f49-4949-8534-5cb45b8975ed', '427f709a-f8a5-4e54-be1f-2ee0ad3335b9', 'Pendaftaran Event: kejuaraan nasional', 200000.00, 'paid', NULL, '2026-04-20 15:25:42.919', '2026-04-20 13:43:16.682', '2026-04-19 15:25:42.920', '2026-04-20 13:43:16.688', 'manual', 'paymentProof-1776612348173-226384920.png'),
('866d4923-3a3d-44e2-a9e7-20054ae42482', '82eced43-825a-4556-8d76-1461b085d343', 'Pendaftaran Event: kejuaraan nasional', 200000.00, 'paid', NULL, '2026-04-19 13:00:52.458', '2026-04-18 13:05:07.670', '2026-04-18 13:00:52.462', '2026-04-18 13:05:07.674', 'manual', 'dummy-gallery-1.png'),
('a343644b-b916-419f-a15e-368a3e0f3046', '82eced43-825a-4556-8d76-1461b085d343', 'Pendaftaran Event: Ujian Kenaikan Sabuk', 250000.00, 'unpaid', NULL, '2026-04-19 13:18:40.698', NULL, '2026-04-18 13:18:40.702', '2026-04-18 13:18:40.702', 'manual', NULL),
('bc10565b-ab8a-48a7-9c28-4b95799e3fa5', '4cb323b7-3970-4cfc-881e-ab0c98f95b19', 'Pendaftaran Member Reguler', 200000.00, 'unpaid', NULL, '2026-04-20 15:34:30.971', NULL, '2026-04-19 15:34:30.971', '2026-04-19 15:34:30.971', 'manual', NULL),
('ce4c6598-718e-4fa3-8585-1b22b10b59f1', 'c0c7dc44-445d-4154-9c4e-6f1131b55bf2', 'Pendaftaran Member Reguler', 200000.00, 'paid', NULL, '2026-04-20 14:58:16.133', '2026-04-20 13:43:22.135', '2026-04-19 14:58:16.134', '2026-04-20 13:43:22.136', 'manual', 'paymentProof-1776611764311-537693583.png'),
('d1a7fbbf-2109-4268-b68b-de22cbfbdeac', '4f0a4087-f68a-43df-8bd1-e874e23530b8', 'Pendaftaran Member Private', 500000.00, 'paid', NULL, '2026-04-18 08:36:44.975', '2026-04-17 08:36:47.199', '2026-04-17 08:36:44.978', '2026-04-17 08:36:47.201', 'manual', NULL),
('dd79f4ab-89ef-414f-a138-f372a5f09b93', '427f709a-f8a5-4e54-be1f-2ee0ad3335b9', 'Pendaftaran Event: Ujian Kenaikan Sabuk', 250000.00, 'paid', NULL, '2026-04-20 15:03:31.562', '2026-04-20 13:43:18.886', '2026-04-19 15:03:31.563', '2026-04-20 13:43:18.887', 'manual', 'paymentProof-1776611018931-915423156.png'),
('e4572fc8-6f1c-4a65-ade4-ca39ff41e3a7', '427f709a-f8a5-4e54-be1f-2ee0ad3335b9', 'Pendaftaran Member Private', 500000.00, 'paid', NULL, '2026-04-20 14:54:31.558', '2026-04-19 14:55:10.576', '2026-04-19 14:54:31.561', '2026-04-19 14:55:10.578', 'manual', 'paymentProof-1776610480051-228016779.png');

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` int NOT NULL DEFAULT '1',
  `club_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logo_url` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `midtrans_server_key` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `midtrans_client_key` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `club_name`, `logo_url`, `midtrans_server_key`, `midtrans_client_key`, `created_at`, `updated_at`) VALUES
(1, 'TAEKWONDO CLUBBB', 'http://example.com/logo.png', 'SB-Mid-server-123456789', 'SB-Mid-client-123456789', '2026-04-09 14:53:30.854', '2026-04-19 07:00:31.550');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('superadmin','club_admin','member_reguler','member_private','candidate') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'candidate',
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `current_belt_id` int DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `birth_date` datetime(3) DEFAULT NULL,
  `birth_place` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gender` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `profile_image_url` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `reset_token` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reset_token_expiry` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `phone`, `current_belt_id`, `created_at`, `updated_at`, `birth_date`, `birth_place`, `gender`, `profile_image_url`, `status`, `reset_token`, `reset_token_expiry`) VALUES
('03c79440-44b8-44b9-a4f3-1c4628cf52ff', 'dian', 'dian@gmail.com', '$2b$12$PyEXxlLLPLu.dcziTBQlyezAgAMq2LqKIVP0LlVU52anPjKyDklwO', 'candidate', '+628228181818181', NULL, '2026-04-20 14:42:08.302', '2026-04-20 14:42:08.302', NULL, NULL, NULL, NULL, 'active', NULL, NULL),
('427f709a-f8a5-4e54-be1f-2ee0ad3335b9', 'farras azhary', 'farrasazhary18@gmail.com', '$2b$12$Mygcpo9C.3oaNpOAe3NCdemR.ZjZCPrrNkhIETkiApYfrEFLTO7kK', 'member_private', '082281047267', 1, '2026-04-19 14:02:21.902', '2026-04-19 15:49:59.984', '2000-11-08 00:00:00.000', 'Tegal', 'Laki-laki', 'profileImage-1776610706670-823862846.png', 'active', NULL, NULL),
('4cb323b7-3970-4cfc-881e-ab0c98f95b19', 'Test Mobile User', 'test@user.com', '$2b$12$MqoTU2v1PcT50p/1E297B.ZhHnLXUSkvk1VyHB/vf4BX3IUlHoM9y', 'candidate', '08123456789', NULL, '2026-04-19 15:23:09.643', '2026-04-19 15:52:23.062', NULL, 'Jakarta', '', NULL, 'active', NULL, NULL),
('4f0a4087-f68a-43df-8bd1-e874e23530b8', 'udin', 'udin@gmail.com', '$2b$12$6Gu/r5HUx4cbsh1H2hG1AefMqcsLDLV4kil9Um.CgNjRtLSICYnVi', 'member_private', '', 1, '2026-04-17 08:30:40.702', '2026-04-17 08:36:47.206', '2026-04-01 00:00:00.000', 'jakarta', 'Laki-laki', NULL, 'active', NULL, NULL),
('6446c7a1-a636-47d8-9f4b-45086fc1ca9d', 'Sabeum ADMIN', 'admin@example.com', '$2b$12$vfPil8U6.3Ibsq6icO9FNOx/EgP0YliR/IS2/UUo/RAVWALiZXiAG', 'club_admin', '082281047722', 13, '2026-04-09 15:03:04.769', '2026-04-19 15:25:03.705', NULL, '', 'Laki-laki', 'profileImage-1776431658326-526079176.jpg', 'active', NULL, NULL),
('82eced43-825a-4556-8d76-1461b085d343', 'John Doe', 'john@example.com', '$2b$12$zF/.CQ8zv7pImM7UxU882OPrnChSpIpc6H4n2flIgDb1W7Jshmjm.', 'candidate', NULL, NULL, '2026-04-18 12:59:37.153', '2026-04-18 12:59:37.153', NULL, NULL, NULL, NULL, 'active', NULL, NULL),
('8a8aede9-c29f-460e-8eda-6a982e6e2df2', 'muhammad fatih ar razyd', 'fatih@gmail.com', '$2b$12$m5MclcwLJeRic6Ws8pW6Vekbtwj4RN12E9gofHPdJyGVNZjoGhGRi', 'candidate', '081377551452', NULL, '2026-04-20 14:37:46.771', '2026-04-20 14:37:46.771', NULL, NULL, NULL, NULL, 'active', NULL, NULL),
('9183b433-2988-427f-9298-f9470a944f97', 'Test User', 'testuser@example.com', '$2b$12$S7xEwJAqz.odg4Drxoq/ZezVJT4GZKDDuLqO.qlNzdEB/ppFrsooy', 'candidate', '081234567890', NULL, '2026-04-19 15:18:44.845', '2026-04-19 15:19:22.939', NULL, '', '', NULL, 'active', NULL, NULL),
('941003fe-a250-4f8a-9e07-3101d90c7216', 'admin123', 'admin@dojang.com', '$2b$12$m7Hfido56s8FE5dCdvbh/unjvn7.Hcml.vFNqqXozHqu.KjJMvCoe', 'candidate', NULL, NULL, '2026-04-20 12:10:45.434', '2026-04-20 12:10:45.434', NULL, NULL, NULL, NULL, 'active', NULL, NULL),
('c0c7dc44-445d-4154-9c4e-6f1131b55bf2', 'Test User Verified', 'test@example.com', '$2b$12$tH2Ti3UAZyd82T7WoW5zeODlT3Y9e2PSos015MoGAAXjOqCq9ZpLS', 'member_reguler', '08123456733', 1, '2026-04-19 14:38:11.746', '2026-04-20 13:43:22.140', NULL, '', '', NULL, 'active', NULL, NULL),
('fdd5425d-027b-4560-a68a-3f77a5dad753', 'ujang', 'ujang@ujang.com', '$2b$12$5f.O9zhafBy605hjUaW3R.3BXf0ETbW1owdUPetHKLnrECvmpfMxC', 'member_reguler', NULL, 4, '2026-04-17 08:37:34.629', '2026-04-19 13:03:31.739', NULL, NULL, NULL, NULL, 'active', NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `belts`
--
ALTER TABLE `belts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `event_registrations`
--
ALTER TABLE `event_registrations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `event_registrations_user_id_event_id_key` (`user_id`,`event_id`),
  ADD UNIQUE KEY `event_registrations_invoice_id_key` (`invoice_id`),
  ADD KEY `event_registrations_event_id_fkey` (`event_id`);

--
-- Indexes for table `gallery`
--
ALTER TABLE `gallery`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `invoices_user_id_idx` (`user_id`),
  ADD KEY `invoices_status_idx` (`status`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_key` (`email`),
  ADD KEY `users_current_belt_id_fkey` (`current_belt_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `belts`
--
ALTER TABLE `belts`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `gallery`
--
ALTER TABLE `gallery`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `event_registrations`
--
ALTER TABLE `event_registrations`
  ADD CONSTRAINT `event_registrations_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `event_registrations_invoice_id_fkey` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `event_registrations_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `invoices`
--
ALTER TABLE `invoices`
  ADD CONSTRAINT `invoices_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_current_belt_id_fkey` FOREIGN KEY (`current_belt_id`) REFERENCES `belts` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
