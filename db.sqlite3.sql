BEGIN TRANSACTION;
CREATE TABLE "roomie_usersettings" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "settings" text NULL, "group_id" integer NOT NULL REFERENCES "roomie_group" ("id"));
CREATE TABLE "roomie_property_likedUsers" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "property_id" integer NOT NULL REFERENCES "roomie_property" ("id"), "user_id" integer NOT NULL REFERENCES "auth_user" ("id"));
INSERT INTO `roomie_property_likedUsers` (id,property_id,user_id) VALUES (7,1,1),
 (10,2,1);
CREATE TABLE "roomie_property" (
	`id`	integer NOT NULL PRIMARY KEY AUTOINCREMENT,
	`description`	text,
	`address1`	TEXT,
	`address2`	TEXT,
	`neighborhood`	TEXT,
	`name`	text,
	`transport`	text,
	`coordinates`	text,
	`propertyPicture`	varchar(100),
	`content_type`	varchar(50)
);
INSERT INTO `roomie_property` (id,description,address1,address2,neighborhood,name,transport,coordinates,propertyPicture,content_type) VALUES (1,'description','address1','address2','shadyside','bakery-living','transport','coordinates','filefields','jpg'),
 (2,'description','address1','address2','McKeeSport','Three Rivers Housing','transport','coordinates','filefields','jpg');
CREATE TABLE "roomie_profile" ("user_id" integer NOT NULL PRIMARY KEY REFERENCES "auth_user" ("id"), "gender" varchar(50) NULL, "nationality" varchar(50) NULL, "program" varchar(50) NULL, "tags" varchar(200) NULL, "picture" varchar(100) NULL, "content_type" varchar(50) NULL, "matchAvailable" bool NOT NULL);
INSERT INTO `roomie_profile` (user_id,gender,nationality,program,tags,picture,content_type,matchAvailable) VALUES (1,'','','','','',NULL,1),
 (2,NULL,NULL,NULL,NULL,'',NULL,1);
CREATE TABLE "roomie_membership" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "alias" text NULL, "joinedTime" datetime NOT NULL, "settings" text NULL, "group_id" integer NOT NULL REFERENCES "roomie_group" ("id"), "user_id" integer NOT NULL REFERENCES "auth_user" ("id"));
CREATE TABLE "roomie_likes" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "likeTime" datetime NOT NULL, "followed_user_id" integer NOT NULL REFERENCES "auth_user" ("id"), "following_user_id" integer NOT NULL REFERENCES "auth_user" ("id"));
CREATE TABLE "roomie_group" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "name" varchar(128) NOT NULL, "createdTime" datetime NOT NULL, "property_id" integer NOT NULL REFERENCES "roomie_property" ("id"));
CREATE TABLE "roomie_floorplan" ("floorPlanPicture" varchar(100) NULL, "content_type" varchar(50) NULL, "name" text NOT NULL PRIMARY KEY, "sqMeters" integer NULL, "price" decimal NULL, "property_id" integer NOT NULL REFERENCES "roomie_property" ("id"));
INSERT INTO `roomie_floorplan` (floorPlanPicture,content_type,name,sqMeters,price,property_id) VALUES ('/static/roomie/img/bg_4','jpg','name4',800,1350,2),
 ('/static/roomie/img/bg_5','jpg','name2',900,1500,1);
CREATE TABLE "roomie_dislikes" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "dislikeTime" datetime NOT NULL, "disliked_user_id" integer NOT NULL REFERENCES "auth_user" ("id"), "disliking_user_id" integer NOT NULL REFERENCES "auth_user" ("id"));
CREATE TABLE "roomie_chats" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "text" text NULL, "time" datetime NOT NULL, "group_id" integer NOT NULL REFERENCES "roomie_group" ("id"), "user_id" integer NOT NULL REFERENCES "auth_user" ("id"));
CREATE TABLE "django_session" ("session_key" varchar(40) NOT NULL PRIMARY KEY, "session_data" text NOT NULL, "expire_date" datetime NOT NULL);
INSERT INTO `django_session` (session_key,session_data,expire_date) VALUES ('vrclfraf55ug1vbxxdoct56l81vk1lbm','MTkxZTUyZWI0ZThhNzNmYzg3YTY2MDg4YzU5ZGM1NWJkZGE4MGU4Zjp7Il9hdXRoX3VzZXJfaGFzaCI6ImI1MTQwZWNjZDM0MTc4ZjlmNzAwZjFiNDI1MDEwZmU4NDg1MmUxYTEiLCJfYXV0aF91c2VyX2JhY2tlbmQiOiJkamFuZ28uY29udHJpYi5hdXRoLmJhY2tlbmRzLk1vZGVsQmFja2VuZCIsIl9hdXRoX3VzZXJfaWQiOiIxIn0=','2017-04-25 03:31:58.023000'),
 ('6pd8qyhd891xzbevyxjpa3ax0cc4hv8c','MTkxZTUyZWI0ZThhNzNmYzg3YTY2MDg4YzU5ZGM1NWJkZGE4MGU4Zjp7Il9hdXRoX3VzZXJfaGFzaCI6ImI1MTQwZWNjZDM0MTc4ZjlmNzAwZjFiNDI1MDEwZmU4NDg1MmUxYTEiLCJfYXV0aF91c2VyX2JhY2tlbmQiOiJkamFuZ28uY29udHJpYi5hdXRoLmJhY2tlbmRzLk1vZGVsQmFja2VuZCIsIl9hdXRoX3VzZXJfaWQiOiIxIn0=','2017-04-27 01:28:56.653000'),
 ('ew6vf2bfdbu8mjqtccjl9gkdffy4q8j2','MTkxZTUyZWI0ZThhNzNmYzg3YTY2MDg4YzU5ZGM1NWJkZGE4MGU4Zjp7Il9hdXRoX3VzZXJfaGFzaCI6ImI1MTQwZWNjZDM0MTc4ZjlmNzAwZjFiNDI1MDEwZmU4NDg1MmUxYTEiLCJfYXV0aF91c2VyX2JhY2tlbmQiOiJkamFuZ28uY29udHJpYi5hdXRoLmJhY2tlbmRzLk1vZGVsQmFja2VuZCIsIl9hdXRoX3VzZXJfaWQiOiIxIn0=','2017-04-27 02:16:21.247000'),
 ('t4qe257r8bnoonufwztf2w04hcomncbt','MTkxZTUyZWI0ZThhNzNmYzg3YTY2MDg4YzU5ZGM1NWJkZGE4MGU4Zjp7Il9hdXRoX3VzZXJfaGFzaCI6ImI1MTQwZWNjZDM0MTc4ZjlmNzAwZjFiNDI1MDEwZmU4NDg1MmUxYTEiLCJfYXV0aF91c2VyX2JhY2tlbmQiOiJkamFuZ28uY29udHJpYi5hdXRoLmJhY2tlbmRzLk1vZGVsQmFja2VuZCIsIl9hdXRoX3VzZXJfaWQiOiIxIn0=','2017-05-01 00:08:47.311000'),
 ('wgn0wbgwvtycajd3h9atawp30nxh2zo9','MTkxZTUyZWI0ZThhNzNmYzg3YTY2MDg4YzU5ZGM1NWJkZGE4MGU4Zjp7Il9hdXRoX3VzZXJfaGFzaCI6ImI1MTQwZWNjZDM0MTc4ZjlmNzAwZjFiNDI1MDEwZmU4NDg1MmUxYTEiLCJfYXV0aF91c2VyX2JhY2tlbmQiOiJkamFuZ28uY29udHJpYi5hdXRoLmJhY2tlbmRzLk1vZGVsQmFja2VuZCIsIl9hdXRoX3VzZXJfaWQiOiIxIn0=','2017-05-04 00:30:02.672895');
CREATE TABLE "django_migrations" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "app" varchar(255) NOT NULL, "name" varchar(255) NOT NULL, "applied" datetime NOT NULL);
INSERT INTO `django_migrations` (id,app,name,applied) VALUES (1,'contenttypes','0001_initial','2017-04-10 23:47:45.510738'),
 (2,'auth','0001_initial','2017-04-10 23:47:45.539060'),
 (3,'admin','0001_initial','2017-04-10 23:47:45.555977'),
 (4,'admin','0002_logentry_remove_auto_add','2017-04-10 23:47:45.572930'),
 (5,'contenttypes','0002_remove_content_type_name','2017-04-10 23:47:45.623777'),
 (6,'auth','0002_alter_permission_name_max_length','2017-04-10 23:47:45.646010'),
 (7,'auth','0003_alter_user_email_max_length','2017-04-10 23:47:45.675504'),
 (8,'auth','0004_alter_user_username_opts','2017-04-10 23:47:45.694968'),
 (9,'auth','0005_alter_user_last_login_null','2017-04-10 23:47:45.711335'),
 (10,'auth','0006_require_contenttypes_0002','2017-04-10 23:47:45.712908'),
 (11,'auth','0007_alter_validators_add_error_messages','2017-04-10 23:47:45.744543'),
 (12,'auth','0008_alter_user_username_max_length','2017-04-10 23:47:45.776769'),
 (13,'roomie','0001_initial','2017-04-10 23:47:46.112381'),
 (14,'sessions','0001_initial','2017-04-10 23:47:46.117490'),
 (15,'roomie','0002_auto_20170419_1557','2017-04-19 19:57:16.866000');
CREATE TABLE "django_content_type" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "app_label" varchar(100) NOT NULL, "model" varchar(100) NOT NULL);
INSERT INTO `django_content_type` (id,app_label,model) VALUES (1,'admin','logentry'),
 (2,'auth','group'),
 (3,'auth','permission'),
 (4,'auth','user'),
 (5,'contenttypes','contenttype'),
 (6,'sessions','session'),
 (7,'roomie','usersettings'),
 (9,'roomie','chats'),
 (10,'roomie','floorplan'),
 (11,'roomie','likes'),
 (12,'roomie','profile'),
 (13,'roomie','membership'),
 (14,'roomie','property'),
 (15,'roomie','group'),
 (16,'roomie','likes_group');
CREATE TABLE "django_admin_log" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "object_id" text NULL, "object_repr" varchar(200) NOT NULL, "action_flag" smallint unsigned NOT NULL, "change_message" text NOT NULL, "content_type_id" integer NULL REFERENCES "django_content_type" ("id"), "user_id" integer NOT NULL REFERENCES "auth_user" ("id"), "action_time" datetime NOT NULL);
CREATE TABLE "auth_user_user_permissions" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "user_id" integer NOT NULL REFERENCES "auth_user" ("id"), "permission_id" integer NOT NULL REFERENCES "auth_permission" ("id"));
CREATE TABLE "auth_user_groups" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "user_id" integer NOT NULL REFERENCES "auth_user" ("id"), "group_id" integer NOT NULL REFERENCES "auth_group" ("id"));
CREATE TABLE "auth_user" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "password" varchar(128) NOT NULL, "last_login" datetime NULL, "is_superuser" bool NOT NULL, "first_name" varchar(30) NOT NULL, "last_name" varchar(30) NOT NULL, "email" varchar(254) NOT NULL, "is_staff" bool NOT NULL, "is_active" bool NOT NULL, "date_joined" datetime NOT NULL, "username" varchar(150) NOT NULL UNIQUE);
INSERT INTO `auth_user` (id,password,last_login,is_superuser,first_name,last_name,email,is_staff,is_active,date_joined,username) VALUES (1,'pbkdf2_sha256$30000$S59imh671wtn$5JcRsbo2ofYjrnF99qofoITtdAQ9AxplPesRWNnhd64=','2017-04-20 00:30:02.471493',0,'sha','qwe','sha@qwe.com',0,1,'2017-04-11 03:31:57.744000','sha'),
 (2,'',NULL,0,'','','',0,1,'2017-04-11 04:46:24.629000','');
CREATE TABLE "auth_permission" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "content_type_id" integer NOT NULL REFERENCES "django_content_type" ("id"), "codename" varchar(100) NOT NULL, "name" varchar(255) NOT NULL);
INSERT INTO `auth_permission` (id,content_type_id,codename,name) VALUES (1,1,'add_logentry','Can add log entry'),
 (2,1,'change_logentry','Can change log entry'),
 (3,1,'delete_logentry','Can delete log entry'),
 (4,2,'add_group','Can add group'),
 (5,2,'change_group','Can change group'),
 (6,2,'delete_group','Can delete group'),
 (7,3,'add_permission','Can add permission'),
 (8,3,'change_permission','Can change permission'),
 (9,3,'delete_permission','Can delete permission'),
 (10,4,'add_user','Can add user'),
 (11,4,'change_user','Can change user'),
 (12,4,'delete_user','Can delete user'),
 (13,5,'add_contenttype','Can add content type'),
 (14,5,'change_contenttype','Can change content type'),
 (15,5,'delete_contenttype','Can delete content type'),
 (16,6,'add_session','Can add session'),
 (17,6,'change_session','Can change session'),
 (18,6,'delete_session','Can delete session'),
 (19,7,'add_usersettings','Can add user settings'),
 (20,7,'change_usersettings','Can change user settings'),
 (21,7,'delete_usersettings','Can delete user settings'),
 (25,9,'add_chats','Can add chats'),
 (26,9,'change_chats','Can change chats'),
 (27,9,'delete_chats','Can delete chats'),
 (28,10,'add_floorplan','Can add floor plan'),
 (29,10,'change_floorplan','Can change floor plan'),
 (30,10,'delete_floorplan','Can delete floor plan'),
 (31,11,'add_likes','Can add likes'),
 (32,11,'change_likes','Can change likes'),
 (33,11,'delete_likes','Can delete likes'),
 (34,12,'add_profile','Can add profile'),
 (35,12,'change_profile','Can change profile'),
 (36,12,'delete_profile','Can delete profile'),
 (37,13,'add_membership','Can add membership'),
 (38,13,'change_membership','Can change membership'),
 (39,13,'delete_membership','Can delete membership'),
 (40,14,'add_property','Can add property'),
 (41,14,'change_property','Can change property'),
 (42,14,'delete_property','Can delete property'),
 (43,15,'add_group','Can add group'),
 (44,15,'change_group','Can change group'),
 (45,15,'delete_group','Can delete group'),
 (46,16,'add_likes_group','Can add likes_ group'),
 (47,16,'change_likes_group','Can change likes_ group'),
 (48,16,'delete_likes_group','Can delete likes_ group');
CREATE TABLE "auth_group_permissions" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "group_id" integer NOT NULL REFERENCES "auth_group" ("id"), "permission_id" integer NOT NULL REFERENCES "auth_permission" ("id"));
CREATE TABLE "auth_group" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "name" varchar(80) NOT NULL UNIQUE);
CREATE INDEX "roomie_usersettings_0e939a4f" ON "roomie_usersettings" ("group_id");
CREATE UNIQUE INDEX "roomie_property_likedUsers_property_id_fa5ce4d4_uniq" ON "roomie_property_likedUsers" ("property_id", "user_id");
CREATE INDEX "roomie_property_likedUsers_e8701ad4" ON "roomie_property_likedUsers" ("user_id");
CREATE INDEX "roomie_property_likedUsers_6bb837ff" ON "roomie_property_likedUsers" ("property_id");
CREATE INDEX "roomie_membership_e8701ad4" ON "roomie_membership" ("user_id");
CREATE INDEX "roomie_membership_0e939a4f" ON "roomie_membership" ("group_id");
CREATE INDEX "roomie_likes_b7995794" ON "roomie_likes" ("followed_user_id");
CREATE INDEX "roomie_likes_595cb9e0" ON "roomie_likes" ("following_user_id");
CREATE INDEX "roomie_group_6bb837ff" ON "roomie_group" ("property_id");
CREATE INDEX "roomie_floorplan_6bb837ff" ON "roomie_floorplan" ("property_id");
CREATE INDEX "roomie_dislikes_e2e5f598" ON "roomie_dislikes" ("disliked_user_id");
CREATE INDEX "roomie_dislikes_23df1b97" ON "roomie_dislikes" ("disliking_user_id");
CREATE INDEX "roomie_chats_e8701ad4" ON "roomie_chats" ("user_id");
CREATE INDEX "roomie_chats_0e939a4f" ON "roomie_chats" ("group_id");
CREATE INDEX "django_session_de54fa62" ON "django_session" ("expire_date");
CREATE UNIQUE INDEX "django_content_type_app_label_76bd3d3b_uniq" ON "django_content_type" ("app_label", "model");
CREATE INDEX "django_admin_log_e8701ad4" ON "django_admin_log" ("user_id");
CREATE INDEX "django_admin_log_417f1b1c" ON "django_admin_log" ("content_type_id");
CREATE UNIQUE INDEX "auth_user_user_permissions_user_id_14a6b632_uniq" ON "auth_user_user_permissions" ("user_id", "permission_id");
CREATE INDEX "auth_user_user_permissions_e8701ad4" ON "auth_user_user_permissions" ("user_id");
CREATE INDEX "auth_user_user_permissions_8373b171" ON "auth_user_user_permissions" ("permission_id");
CREATE UNIQUE INDEX "auth_user_groups_user_id_94350c0c_uniq" ON "auth_user_groups" ("user_id", "group_id");
CREATE INDEX "auth_user_groups_e8701ad4" ON "auth_user_groups" ("user_id");
CREATE INDEX "auth_user_groups_0e939a4f" ON "auth_user_groups" ("group_id");
CREATE UNIQUE INDEX "auth_permission_content_type_id_01ab375a_uniq" ON "auth_permission" ("content_type_id", "codename");
CREATE INDEX "auth_permission_417f1b1c" ON "auth_permission" ("content_type_id");
CREATE UNIQUE INDEX "auth_group_permissions_group_id_0cd325b0_uniq" ON "auth_group_permissions" ("group_id", "permission_id");
CREATE INDEX "auth_group_permissions_8373b171" ON "auth_group_permissions" ("permission_id");
CREATE INDEX "auth_group_permissions_0e939a4f" ON "auth_group_permissions" ("group_id");
COMMIT;
